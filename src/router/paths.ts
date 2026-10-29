import type { Screen } from "../types";

export const ROUTES = {
  login: "/login",
  customer: "/customer",
  store: "/store",
  delivery: "/delivery",
  admin: "/admin",
};

/** Maps the existing `Screen` union (used across customer pages) to a real URL. */
export function screenPath(screen: Screen): string {
  switch (screen.name) {
    case "home": return "/customer";
    case "search": return "/customer/search";
    case "categories": return "/customer/categories";
    case "category": return `/customer/category/${screen.id}`;
    case "product": return `/customer/product/${screen.id}`;
    case "cart": return "/customer/cart";
    case "checkout": return "/customer/checkout";
    case "tracking": return `/customer/tracking/${screen.id}`;
    case "orders": return "/customer/orders";
    case "profile": return "/customer/profile";
  }
}
