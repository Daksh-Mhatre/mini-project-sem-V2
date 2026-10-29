-- Padosi AI — core schema, RLS policies and trusted order functions.
-- Run this against a fresh Supabase project (SQL Editor or `supabase db push`).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Reference tables (read-only to clients, written only by admins/migrations)
-- ---------------------------------------------------------------------------

create table if not exists public.stores (
  id text primary key,
  name text not null,
  rating numeric(2,1) not null default 4.5,
  distance numeric(4,1) not null,
  delivery_time text not null,
  area text not null,
  status text not null default 'online' check (status in ('online', 'offline'))
);

create table if not exists public.delivery_partners (
  id text primary key,
  name text not null,
  vehicle text not null,
  rating numeric(2,1) not null default 4.5
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  price numeric(10,2) not null,
  original_price numeric(10,2),
  quantity text not null
);

-- ---------------------------------------------------------------------------
-- Profiles: one row per authenticated user, carrying their platform role.
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('customer', 'store', 'delivery', 'admin')),
  name text not null,
  phone text,
  store_id text references public.stores (id),
  partner_id text references public.delivery_partners (id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Orders + order items. Clients never write these directly — only the
-- SECURITY DEFINER functions below do, after validating role + transitions.
-- ---------------------------------------------------------------------------

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id),
  customer_name text not null,
  store_id text not null references public.stores (id),
  delivery_partner_id text references public.delivery_partners (id),
  item_total numeric(10,2) not null,
  delivery_fee numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  payment text not null,
  address text not null,
  status text not null default 'finding'
    check (status in ('finding','placed','preparing','ready','assigned','picked','out','delivered','rejected')),
  history jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text not null references public.products (id),
  name text not null,
  qty integer not null check (qty > 0),
  unit_price numeric(10,2) not null
);

create index if not exists orders_store_idx on public.orders (store_id);
create index if not exists orders_customer_idx on public.orders (customer_id);
create index if not exists orders_delivery_idx on public.orders (delivery_partner_id);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.stores enable row level security;
alter table public.delivery_partners enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create or replace function public.current_role() returns text
language sql stable security definer as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_store_id() returns text
language sql stable security definer as $$
  select store_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_partner_id() returns text
language sql stable security definer as $$
  select partner_id from public.profiles where id = auth.uid();
$$;

-- Catalogue data: readable by any signed-in user, writable only by admins.
create policy "catalogue readable" on public.stores for select using (true);
create policy "catalogue readable" on public.delivery_partners for select using (true);
create policy "catalogue readable" on public.products for select using (true);

-- Profiles: a user can see + create/update their own profile. Admins see all.
create policy "profile self select" on public.profiles for select
  using (id = auth.uid() or public.current_role() = 'admin');
create policy "profile self upsert" on public.profiles for insert
  with check (id = auth.uid());
create policy "profile self update" on public.profiles for update
  using (id = auth.uid());

-- Orders: visible only to the customer who placed it, the assigned store,
-- eligible/assigned delivery partners, or an admin. No direct writes.
create policy "orders visible to owner" on public.orders for select using (
  customer_id = auth.uid()
  or (public.current_role() = 'store' and store_id = public.current_store_id())
  or (public.current_role() = 'delivery' and (
        delivery_partner_id = public.current_partner_id()
        or (status = 'ready' and delivery_partner_id is null)
      ))
  or public.current_role() = 'admin'
);

create policy "order items visible with order" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id)
);

-- Deliberately no insert/update/delete policies on orders/order_items for
-- normal client roles: all writes go through the SECURITY DEFINER functions
-- below, which perform their own authorization + state-machine checks.

-- ---------------------------------------------------------------------------
-- Trusted RPCs
-- ---------------------------------------------------------------------------

create or replace function public.create_order(
  p_store_id text, p_items jsonb, p_payment text, p_address text
) returns uuid
language plpgsql security definer as $$
declare
  v_customer record;
  v_order_id uuid;
  v_item jsonb;
  v_product public.products%rowtype;
  v_item_total numeric := 0;
  v_delivery_fee numeric;
  v_discount numeric;
begin
  select * into v_customer from public.profiles where id = auth.uid() and role = 'customer';
  if not found then
    raise exception 'Only signed-in customers can place orders';
  end if;

  if jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  v_order_id := gen_random_uuid();

  -- Prices are always re-read from the trusted `products` table here,
  -- never taken from the client payload.
  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_product from public.products where id = (v_item->>'productId');
    if not found then
      raise exception 'Unknown product %', v_item->>'productId';
    end if;
    v_item_total := v_item_total + v_product.price * (v_item->>'qty')::int;

    insert into public.order_items (order_id, product_id, name, qty, unit_price)
    values (v_order_id, v_product.id, v_product.name, (v_item->>'qty')::int, v_product.price);
  end loop;

  v_delivery_fee := case when v_item_total >= 299 then 0 else 20 end;
  v_discount := case when v_item_total >= 199 then 30 else 0 end;

  insert into public.orders (
    id, customer_id, customer_name, store_id, item_total, delivery_fee, discount, total,
    payment, address, status, history
  ) values (
    v_order_id, v_customer.id, v_customer.name, p_store_id, v_item_total, v_delivery_fee, v_discount,
    v_item_total + v_delivery_fee - v_discount, p_payment, p_address, 'finding',
    jsonb_build_array(jsonb_build_object('status', 'finding', 'at', extract(epoch from now()) * 1000))
  );

  return v_order_id;
end;
$$;

create or replace function public.update_order_status(p_order_id uuid, p_status text) returns void
language plpgsql security definer as $$
declare
  v_order public.orders%rowtype;
  v_role text := public.current_role();
  v_allowed boolean := false;
begin
  select * into v_order from public.orders where id = p_order_id;
  if not found then raise exception 'Order not found'; end if;

  if v_role = 'store' and v_order.store_id = public.current_store_id() then
    v_allowed := v_order.status = 'placed' and p_status in ('preparing', 'rejected')
      or v_order.status = 'preparing' and p_status in ('ready', 'rejected')
      or v_order.status = 'ready' and p_status = 'rejected';
  elsif v_role = 'delivery' and v_order.delivery_partner_id = public.current_partner_id() then
    v_allowed := v_order.status = 'assigned' and p_status = 'picked'
      or v_order.status = 'picked' and p_status = 'out'
      or v_order.status = 'out' and p_status = 'delivered';
  end if;

  if not v_allowed then
    raise exception 'Invalid transition % -> % for role %', v_order.status, p_status, v_role;
  end if;

  update public.orders set
    status = p_status,
    updated_at = now(),
    history = v_order.history || jsonb_build_object('status', p_status, 'at', extract(epoch from now()) * 1000)
  where id = p_order_id;
end;
$$;

create or replace function public.claim_delivery(p_order_id uuid) returns void
language plpgsql security definer as $$
declare
  v_partner_id text := public.current_partner_id();
  v_updated int;
begin
  if public.current_role() <> 'delivery' or v_partner_id is null then
    raise exception 'Only delivery partners can claim deliveries';
  end if;

  update public.orders
  set delivery_partner_id = v_partner_id,
      status = 'assigned',
      updated_at = now(),
      history = history || jsonb_build_object('status', 'assigned', 'at', extract(epoch from now()) * 1000)
  where id = p_order_id and status = 'ready' and delivery_partner_id is null;

  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'Order already claimed by another delivery partner or not ready yet';
  end if;
end;
$$;

-- Simulate the platform auto-routing a freshly placed order to the store.
create or replace function public.auto_accept_routing() returns trigger
language plpgsql as $$
begin
  if new.status = 'finding' then
    perform pg_sleep(0); -- placeholder: real routing logic would pick nearest store
  end if;
  return new;
end;
$$;

-- Enable realtime for the two tables every dashboard subscribes to.
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;
