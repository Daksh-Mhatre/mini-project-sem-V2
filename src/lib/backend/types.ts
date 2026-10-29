import type { OrderStatus } from "../../types";
import type { CreateOrderInput, OrderRecord, Profile, UserRole } from "../../types/db";

export interface OrderResult {
  order?: OrderRecord;
  error?: string;
}

/**
 * Every environment (real Supabase project, or the in-browser demo
 * backend) implements this exact contract. UI code never talks to
 * Supabase or localStorage directly — only through this interface —
 * so swapping the backend never touches a single page component.
 */
export interface Backend {
  readonly mode: "supabase" | "local";

  signInDemo(role: UserRole): Promise<Profile>;
  signOut(): Promise<void>;
  getSession(): Promise<Profile | null>;

  createOrder(customer: Profile, input: CreateOrderInput): Promise<OrderResult>;

  updateStatus(orderId: string, to: OrderStatus, actor: Profile): Promise<OrderResult>;
  claimDelivery(orderId: string, partner: Profile): Promise<OrderResult>;

  getOrder(orderId: string): Promise<OrderRecord | null>;
  listForCustomer(customerId: string): Promise<OrderRecord[]>;
  listForStore(storeId: string): Promise<OrderRecord[]>;
  listAvailableForDelivery(): Promise<OrderRecord[]>;
  listForPartner(partnerId: string): Promise<OrderRecord[]>;
  listAll(): Promise<OrderRecord[]>;

  /** Subscribe to every order change relevant to this process. Returns an unsubscribe fn. */
  subscribe(onChange: () => void): () => void;
}
