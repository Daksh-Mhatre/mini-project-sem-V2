# Padosi AI — Multi-Role Setup & Architecture Notes

This document explains the role-separated architecture, how the two
backends work, and exactly what has been verified versus what requires
your own Supabase project to test live.

## 1. What changed from the single-page prototype

| Before | Now |
|---|---|
| One `RoleSwitcher` bar swapped UI inside a single page | Four real routes: `/#/customer`, `/#/store`, `/#/delivery`, `/#/admin`, each behind its own layout and login |
| Orders lived only in a React Context (`AppContext`), reset on refresh | Orders live in a `Backend` (Supabase **or** local demo), persisted and shared across tabs |
| "Login" just set a role in memory | `/#/login` signs in through `AuthContext`, backed by Supabase Auth or a local session |
| No validation of status changes | `src/lib/orderStateMachine.ts` is the single transition map, enforced both client-side and in the Postgres functions |

The customer shopping UI, cards, cart, checkout and tracking screens are
unchanged visually — only their data source moved from local mock arrays to
the shared `Backend` interface.

## 2. Two interchangeable backends

`src/lib/backend/index.ts` picks one implementation at build time:

- **`SupabaseBackend`** (`src/lib/backend/supabaseBackend.ts`) — used automatically
  when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set. Talks to a real
  Postgres database, uses Supabase Auth, and subscribes to
  `postgres_changes` for realtime sync. Pricing, status-transition validation,
  and the atomic "claim this delivery" operation are implemented as
  `SECURITY DEFINER` SQL functions (`supabase/migrations/0001_schema.sql`), not
  in the browser.
- **`LocalBackend`** (`src/lib/backend/localBackend.ts`) — used when no Supabase
  credentials are configured (the default in this sandbox). Persists orders and
  the session in `localStorage`, and broadcasts changes with `BroadcastChannel`
  + the native `storage` event, so every open tab of the same browser reflects
  the same data in real time without polling.

**Both implement the exact same `Backend` TypeScript interface**
(`src/lib/backend/types.ts`), so no page component needs to know or care which
one is active.

## 3. Routes

| Path | Who | Notes |
|---|---|---|
| `/#/login` | everyone | demo role picker, see below |
| `/#/customer`, `/customer/search`, `/customer/category/:id`, `/customer/product/:id`, `/customer/cart`, `/customer/checkout`, `/customer/tracking/:id`, `/customer/orders`, `/customer/profile` | customer | guarded by `ProtectedRoute role="customer"` |
| `/#/store` | store partner | guarded by `ProtectedRoute role="store"` |
| `/#/delivery` | delivery partner | guarded by `ProtectedRoute role="delivery"` |
| `/#/admin` | admin | guarded by `ProtectedRoute role="admin"` |

**Why `HashRouter` and not `BrowserRouter`:** the build output is a single
static `dist/index.html` (`vite-plugin-singlefile`) served with no backend
process and no server-side rewrite rules configured in this environment. A
`BrowserRouter` would 404 on a hard refresh of `/customer/cart` on most static
hosts. `HashRouter` keeps everything after `#` client-side, so **every deep
link survives a refresh and works if you open the URL directly**, with zero
server configuration. If you deploy behind a server you control and add a
catch-all rewrite to `index.html`, switching to `BrowserRouter` is a one-line
change in `src/App.tsx`.

## 4. Demo accounts / login

`/#/login` offers four buttons. In **local mode** these instantly create an
in-memory session for a fixed demo identity (`customer-1`, `store-freshmart`,
`delivery-1` → partner `rahul`, `admin-1`) — no password, clearly labelled as
a demo, not a real account system.

In **Supabase mode**, the same buttons sign up/in a fixed demo email
(`demo-<role>@padosi.app` / `padosi-demo-2024`) and upsert a `profiles` row for
that user with the chosen role (and `store_id`/`partner_id` where relevant).
This is a convenience for presenting the prototype; a production version
would replace it with real customer sign-up, store-staff invites, and
delivery-partner onboarding.

## 5. Running locally

```bash
npm install
npm run dev
```

With no `.env.local`, the app runs entirely in **Local Demo Mode** — open the
built app in two or three browser tabs (one per role) to see the same order
move across Store → Delivery → Customer live, backed by `localStorage` +
`BroadcastChannel`.

### Connecting a real Supabase project

1. Create a project at supabase.com.
2. In the SQL editor, run `supabase/migrations/0001_schema.sql` then
   `supabase/migrations/0002_seed.sql`.
3. In **Database → Replication**, confirm `orders` and `order_items` are in
   the `supabase_realtime` publication (the migration adds them automatically).
4. Copy `.env.example` to `.env.local` and fill in your project URL and anon
   key.
5. Restart `npm run dev` (or re-run `npm run build`). The app now talks to
   Postgres instead of `localStorage`.

## 6. What has been verified vs. what has not

This sandbox has no ability to create an external Supabase project or run a
browser, so the two backends were validated differently:

- ✅ **Verified in this environment:** `npm run build` and `tsc --noEmit` pass
  with zero errors. The `LocalBackend` state machine, authorization checks,
  and delivery-claim concurrency were exercised directly with a scripted
  multi-actor test (customer → store accept/reject/ready → delivery claim →
  pickup → delivered), including two negative cases: a second delivery
  partner's claim is rejected, and a store that doesn't own the order cannot
  update it. All assertions passed.
- ⚠️ **Not verified (requires your credentials):** a live, cross-device test
  against a real Supabase project, Supabase Auth session handling in a real
  browser, and the exact SQL function behaviour under concurrent load. The SQL
  in `supabase/migrations/` type-checks against Postgres syntax and mirrors
  the already-verified local logic, but it has not been executed against a
  live database from here. Please run the steps in section 5 and the demo
  flow in section 7 yourself once you have a project.

## 7. Suggested live demo flow (once Supabase is configured, or using
   multiple local tabs)

1. Tab 1 → `/#/login` → **Continue as Customer** → add Milk, Bread, Eggs →
   Cart → Checkout → Place Order.
2. Tab 2 (new tab) → `/#/login` → **Continue as Store Partner** → see the new
   order appear without refreshing → Accept → Mark Order Ready.
3. Back in Tab 1 → tracking screen updates automatically.
4. Tab 3 (new tab) → `/#/login` → **Continue as Delivery Partner** → see the
   ready order → Accept Delivery → Order picked up → Start Delivery → Mark as
   Delivered.
5. Tab 1 → shows "Order Delivered ✓" without a refresh.
6. Tab 4 → `/#/login` → **Continue as Admin** → see the same order in "Live
   orders" with status "Delivered".
7. Refresh all four tabs → state is unchanged (persisted, not just in memory).

## 8. Known limitations (college-prototype scope)

- Local mode's "authorization" is enforced in the `LocalBackend` class, not a
  real server — a determined user could open devtools and bypass it. Only the
  Supabase + RLS path is a real security boundary.
- There is a single hard-coded customer identity and a single hard-coded
  delivery partner (`rahul`) actually wired into the demo buttons; `imran`
  exists in the catalogue but has no login.
- No payment gateway, no real GPS/routing — both explicitly simulated, as the
  project brief requires.
- Cart contents are client-only until checkout (not persisted to the
  backend); only placed orders are shared/persistent data.
