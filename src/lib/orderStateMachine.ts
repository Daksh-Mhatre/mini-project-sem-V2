import type { OrderStatus } from "../types";

/**
 * Single source of truth for valid order-status transitions.
 * Both the local demo backend and the Supabase SQL function
 * (see supabase/migrations/0001_init.sql) mirror this exact map,
 * so the rules never drift between environments.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  finding: ["placed", "rejected"],
  placed: ["preparing", "rejected"],
  preparing: ["ready", "rejected"],
  ready: ["assigned", "rejected"],
  assigned: ["picked", "rejected"],
  picked: ["out"],
  out: ["delivered"],
  delivered: [],
  rejected: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: OrderStatus, to: OrderStatus) {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid order transition: ${from} → ${to}`);
  }
}

/** Which role is allowed to perform a given transition. */
export function transitionRole(to: OrderStatus): "store" | "delivery" | "system" {
  if (to === "preparing" || to === "ready" || to === "rejected") return "store";
  if (to === "assigned" || to === "picked" || to === "out" || to === "delivered") return "delivery";
  return "system";
}
