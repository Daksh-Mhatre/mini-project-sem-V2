import type { OrderStatus } from "../../types";
import type { CreateOrderInput, OrderRecord, Profile, UserRole } from "../../types/db";
import { DELIVERY_FEE, DISCOUNT_AMOUNT, DISCOUNT_THRESHOLD, FREE_DELIVERY_ABOVE } from "../pricing";
import { findProduct } from "../../data/products";
import { currentUser, deliveryPartners } from "../../data/stores";
import { assertTransition } from "../orderStateMachine";
import type { Backend, OrderResult } from "./types";

const ORDERS_KEY = "padosi.local.orders.v1";
const SESSION_KEY = "padosi.local.session.v1";
const CHANNEL = "padosi-local-sync";

const DEMO_PROFILES: Record<UserRole, Profile> = {
  customer: { id: "customer-1", role: "customer", name: currentUser.name, phone: currentUser.phone },
  store: { id: "store-freshmart", role: "store", name: "Fresh Mart staff", storeId: "freshmart" },
  delivery: { id: "delivery-1", role: "delivery", name: deliveryPartners[0].name, partnerId: deliveryPartners[0].id },
  admin: { id: "admin-1", role: "admin", name: "Platform admin" },
};

function readOrders(): OrderRecord[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeOrders(orders: OrderRecord[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

let idCounter = 1024;

/**
 * Demo/local backend: persists in `localStorage` (so a refresh keeps data)
 * and broadcasts changes through `BroadcastChannel` + the native `storage`
 * event, giving genuine real-time sync across browser tabs on this device.
 * It implements the exact same `Backend` contract as the Supabase backend,
 * so this is NOT a separate mock UI state — it is the single source of
 * truth for every role while no Supabase project is configured.
 */
export class LocalBackend implements Backend {
  readonly mode = "local" as const;
  private channel: BroadcastChannel | null =
    typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL) : null;

  async signInDemo(role: UserRole) {
    const profile = DEMO_PROFILES[role];
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    this.notify();
    return profile;
  }

  async signOut() {
    localStorage.removeItem(SESSION_KEY);
    this.notify();
  }

  async getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as Profile) : null;
    } catch {
      return null;
    }
  }

  async createOrder(customer: Profile, input: CreateOrderInput): Promise<OrderResult> {
    if (input.items.length === 0) return { error: "Cart is empty" };

    // Prices are recalculated here from the trusted product catalogue,
    // never taken from client-submitted totals.
    const items = input.items.map(({ productId, qty }) => {
      const product = findProduct(productId);
      if (!product) throw new Error(`Unknown product ${productId}`);
      return { productId, name: product.name, qty, unitPrice: product.price };
    });
    const itemTotal = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
    const deliveryFee = itemTotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
    const discount = itemTotal >= DISCOUNT_THRESHOLD ? DISCOUNT_AMOUNT : 0;

    const now = Date.now();
    const order: OrderRecord = {
      id: String(idCounter++),
      customerId: customer.id,
      customerName: customer.name,
      storeId: input.storeId,
      deliveryPartnerId: null,
      items,
      itemTotal,
      deliveryFee,
      discount,
      total: itemTotal + deliveryFee - discount,
      payment: input.payment,
      address: input.address,
      status: "finding",
      createdAt: now,
      updatedAt: now,
      history: [{ status: "finding", at: now }],
    };

    const orders = readOrders();
    orders.unshift(order);
    writeOrders(orders);
    this.notify();

    // Simulate the platform routing the order to the nearest store.
    window.setTimeout(() => {
      this.forceStatus(order.id, "placed");
    }, 2000);

    return { order };
  }

  private forceStatus(orderId: string, status: OrderStatus) {
    const orders = readOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return;
    const now = Date.now();
    orders[idx] = { ...orders[idx], status, updatedAt: now, history: [...orders[idx].history, { status, at: now }] };
    writeOrders(orders);
    this.notify();
  }

  async updateStatus(orderId: string, to: OrderStatus, actor: Profile): Promise<OrderResult> {
    const orders = readOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return { error: "Order not found" };
    const order = orders[idx];

    if (actor.role === "store" && order.storeId !== actor.storeId) return { error: "Not authorized for this store" };
    if (actor.role === "delivery" && order.deliveryPartnerId !== actor.partnerId) return { error: "Not your delivery" };

    try {
      assertTransition(order.status, to);
    } catch (e) {
      return { error: (e as Error).message };
    }

    const now = Date.now();
    const updated: OrderRecord = { ...order, status: to, updatedAt: now, history: [...order.history, { status: to, at: now }] };
    orders[idx] = updated;
    writeOrders(orders);
    this.notify();
    return { order: updated };
  }

  async claimDelivery(orderId: string, partner: Profile): Promise<OrderResult> {
    const orders = readOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return { error: "Order not found" };
    const order = orders[idx];

    // Atomic-style compare-and-set: refuse if another partner already claimed it.
    if (order.deliveryPartnerId && order.deliveryPartnerId !== partner.partnerId) {
      return { error: "Already claimed by another delivery partner" };
    }
    if (order.status !== "ready") return { error: "Order is not ready for pickup yet" };

    const now = Date.now();
    const updated: OrderRecord = {
      ...order,
      deliveryPartnerId: partner.partnerId ?? partner.id,
      status: "assigned",
      updatedAt: now,
      history: [...order.history, { status: "assigned", at: now }],
    };
    orders[idx] = updated;
    writeOrders(orders);
    this.notify();
    return { order: updated };
  }

  async getOrder(orderId: string) {
    return readOrders().find((o) => o.id === orderId) ?? null;
  }
  async listForCustomer(customerId: string) {
    return readOrders().filter((o) => o.customerId === customerId);
  }
  async listForStore(storeId: string) {
    return readOrders().filter((o) => o.storeId === storeId);
  }
  async listAvailableForDelivery() {
    return readOrders().filter((o) => o.status === "ready" && !o.deliveryPartnerId);
  }
  async listForPartner(partnerId: string) {
    return readOrders().filter((o) => o.deliveryPartnerId === partnerId);
  }
  async listAll() {
    return readOrders();
  }

  subscribe(onChange: () => void) {
    const handler = () => onChange();
    this.channel?.addEventListener("message", handler);
    window.addEventListener("storage", handler);
    return () => {
      this.channel?.removeEventListener("message", handler);
      window.removeEventListener("storage", handler);
    };
  }

  private notify() {
    this.channel?.postMessage({ at: Date.now() });
    window.dispatchEvent(new StorageEvent("storage", { key: ORDERS_KEY }));
  }
}
