import type { OrderStatus } from "./index";

export type UserRole = "customer" | "store" | "delivery" | "admin";

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  phone?: string;
  storeId?: string;
  partnerId?: string;
}

export interface Session {
  profile: Profile;
}

export interface OrderItemRecord {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface OrderRecord {
  id: string;
  customerId: string;
  customerName: string;
  storeId: string;
  deliveryPartnerId: string | null;
  items: OrderItemRecord[];
  itemTotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  payment: string;
  address: string;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  history: { status: OrderStatus; at: number }[];
}

export interface CreateOrderInput {
  storeId: string;
  items: { productId: string; qty: number }[];
  payment: string;
  address: string;
}

export type BackendMode = "supabase" | "local";
