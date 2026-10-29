import type { OrderStatus, Product } from "../types";

export const rupee = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const discountPercent = (p: Product) =>
  p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;

export const statusLabel: Record<OrderStatus, string> = {
  finding: "Finding store",
  placed: "New order",
  preparing: "Preparing",
  ready: "Ready for pickup",
  assigned: "Partner assigned",
  picked: "Picked up",
  out: "Out for delivery",
  delivered: "Delivered",
  rejected: "Rejected",
};

export const statusRank: Record<OrderStatus, number> = {
  finding: 0,
  placed: 1,
  preparing: 2,
  ready: 3,
  assigned: 4,
  picked: 5,
  out: 6,
  delivered: 7,
  rejected: -1,
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};
