import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { findProduct } from "../data/products";
import { DELIVERY_FEE, DISCOUNT_AMOUNT, DISCOUNT_THRESHOLD, FREE_DELIVERY_ABOVE } from "../lib/pricing";

interface Bill {
  count: number;
  itemTotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

interface AppState {
  storeId: string;
  setStoreId: (id: string) => void;
  cart: Record<string, number>;
  setQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  bill: Bill;
  toast: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppState | null>(null);

/**
 * Client-only UI/cart state. Nothing persistence-critical lives here —
 * once an order is placed it is handed off to OrdersContext, which talks
 * to the shared backend. This keeps the cart snappy (no network round
 * trip per click) while orders remain a single source of truth.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [storeId, setStoreId] = useState("freshmart");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[productId];
      else next[productId] = qty;
      return next;
    });
  }, []);

  const clearCart = useCallback(() => setCart({}), []);

  const bill = useMemo<Bill>(() => {
    let count = 0;
    let itemTotal = 0;
    for (const [id, qty] of Object.entries(cart)) {
      const p = findProduct(id);
      if (!p) continue;
      count += qty;
      itemTotal += p.price * qty;
    }
    const deliveryFee = itemTotal === 0 || itemTotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
    const discount = itemTotal >= DISCOUNT_THRESHOLD ? DISCOUNT_AMOUNT : 0;
    return { count, itemTotal, deliveryFee, discount, total: itemTotal + deliveryFee - discount };
  }, [cart]);

  const value: AppState = { storeId, setStoreId, cart, setQty, clearCart, bill, toast, showToast };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
