import type { OrderStatus } from "../../types";
import type { CreateOrderInput, OrderItemRecord, OrderRecord, Profile, UserRole } from "../../types/db";
import { supabase } from "../supabaseClient";
import type { Backend, OrderResult } from "./types";

const DEMO_SEED: Record<UserRole, { role: UserRole; name: string; store_id: string | null; partner_id: string | null }> = {
  customer: { role: "customer", name: "Aarav", store_id: null, partner_id: null },
  store: { role: "store", name: "Fresh Mart staff", store_id: "freshmart", partner_id: null },
  delivery: { role: "delivery", name: "Rahul", store_id: null, partner_id: "rahul" },
  admin: { role: "admin", name: "Platform admin", store_id: null, partner_id: null },
};

/**
 * Talks to a real Supabase/Postgres project. Requires VITE_SUPABASE_URL and
 * VITE_SUPABASE_ANON_KEY (see .env.example). All trust-sensitive work
 * (pricing, transition validation, atomic delivery claims, row access) is
 * done by Postgres functions + RLS policies in supabase/migrations/, not
 * by this client — this file only shapes requests/responses.
 */
export class SupabaseBackend implements Backend {
  readonly mode = "supabase" as const;

  private db() {
    if (!supabase) throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
    return supabase;
  }

  async signInDemo(role: UserRole): Promise<Profile> {
    const db = this.db();
    const email = `demo-${role}@padosi.app`;
    const password = "padosi-demo-2024";
    let { error } = await db.auth.signInWithPassword({ email, password });
    if (error) {
      const signUp = await db.auth.signUp({ email, password });
      error = signUp.error;
    }
    if (error) throw error;

    // Demo convenience only: give this freshly authenticated user a role
    // profile. RLS only allows writing your own profile row (id = auth.uid()),
    // so this cannot be used to impersonate another account.
    const { data: auth } = await db.auth.getUser();
    if (auth.user) {
      const seed = DEMO_SEED[role];
      await db.from("profiles").upsert({ id: auth.user.id, ...seed });
    }

    return this.requireProfile();
  }

  async signOut() {
    await this.db().auth.signOut();
  }

  async getSession(): Promise<Profile | null> {
    const db = this.db();
    const { data } = await db.auth.getSession();
    if (!data.session) return null;
    try {
      return await this.requireProfile();
    } catch {
      return null;
    }
  }

  private async requireProfile(): Promise<Profile> {
    const db = this.db();
    const { data: auth } = await db.auth.getUser();
    if (!auth.user) throw new Error("Not signed in");
    const { data, error } = await db.from("profiles").select("*").eq("id", auth.user.id).single();
    if (error || !data) throw error ?? new Error("Profile not found");
    return {
      id: data.id,
      role: data.role,
      name: data.name,
      phone: data.phone ?? undefined,
      storeId: data.store_id ?? undefined,
      partnerId: data.partner_id ?? undefined,
    };
  }

  async createOrder(_customer: Profile, input: CreateOrderInput): Promise<OrderResult> {
    const db = this.db();
    const { data, error } = await db.rpc("create_order", {
      p_store_id: input.storeId,
      p_items: input.items,
      p_payment: input.payment,
      p_address: input.address,
    });
    if (error) return { error: error.message };
    const order = await this.getOrder(data as string);
    return order ? { order } : { error: "Order created but could not be loaded" };
  }

  async updateStatus(orderId: string, to: OrderStatus, _actor: Profile): Promise<OrderResult> {
    const db = this.db();
    const { error } = await db.rpc("update_order_status", { p_order_id: orderId, p_status: to });
    if (error) return { error: error.message };
    const order = await this.getOrder(orderId);
    return order ? { order } : { error: "Order updated but could not be loaded" };
  }

  async claimDelivery(orderId: string, _partner: Profile): Promise<OrderResult> {
    const db = this.db();
    const { error } = await db.rpc("claim_delivery", { p_order_id: orderId });
    if (error) return { error: error.message };
    const order = await this.getOrder(orderId);
    return order ? { order } : { error: "Delivery claimed but order could not be loaded" };
  }

  async getOrder(orderId: string) {
    const { data, error } = await this.db()
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .maybeSingle();
    if (error || !data) return null;
    return mapOrder(data);
  }

  async listForCustomer(customerId: string) {
    const { data } = await this.db().from("orders").select("*, order_items(*)").eq("customer_id", customerId).order("created_at", { ascending: false });
    return (data ?? []).map(mapOrder);
  }
  async listForStore(storeId: string) {
    const { data } = await this.db().from("orders").select("*, order_items(*)").eq("store_id", storeId).order("created_at", { ascending: false });
    return (data ?? []).map(mapOrder);
  }
  async listAvailableForDelivery() {
    const { data } = await this.db().from("orders").select("*, order_items(*)").eq("status", "ready").is("delivery_partner_id", null);
    return (data ?? []).map(mapOrder);
  }
  async listForPartner(partnerId: string) {
    const { data } = await this.db().from("orders").select("*, order_items(*)").eq("delivery_partner_id", partnerId).order("created_at", { ascending: false });
    return (data ?? []).map(mapOrder);
  }
  async listAll() {
    const { data } = await this.db().from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(200);
    return (data ?? []).map(mapOrder);
  }

  subscribe(onChange: () => void) {
    const db = this.db();
    const channel = db
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, onChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, onChange)
      .subscribe();
    return () => {
      db.removeChannel(channel);
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOrder(row: any): OrderRecord {
  const items: OrderItemRecord[] = (row.order_items ?? []).map((i: any) => ({
    productId: i.product_id,
    name: i.name,
    qty: i.qty,
    unitPrice: Number(i.unit_price),
  }));
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    storeId: row.store_id,
    deliveryPartnerId: row.delivery_partner_id,
    items,
    itemTotal: Number(row.item_total),
    deliveryFee: Number(row.delivery_fee),
    discount: Number(row.discount),
    total: Number(row.total),
    payment: row.payment,
    address: row.address,
    status: row.status,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
    history: row.history ?? [],
  };
}
