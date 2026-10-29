import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { OrderStatus } from "../types";
import type { CreateOrderInput, OrderRecord } from "../types/db";
import { backend } from "../lib/backend";
import { useAuth } from "./AuthContext";

interface OrdersState {
  orders: OrderRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  placeOrder: (input: CreateOrderInput) => Promise<OrderRecord | null>;
  updateStatus: (orderId: string, to: OrderStatus) => Promise<boolean>;
  claimDelivery: (orderId: string) => Promise<boolean>;
}

const OrdersContext = createContext<OrdersState | null>(null);

/**
 * Loads every order this role is allowed to see, then subscribes to the
 * backend's change feed (Supabase Realtime, or BroadcastChannel in local
 * demo mode) so all four interfaces reflect the same persisted data
 * without manual refreshing.
 */
export function OrdersProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) {
      setOrders([]);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      let result: OrderRecord[] = [];
      if (profile.role === "customer") result = await backend.listForCustomer(profile.id);
      else if (profile.role === "store" && profile.storeId) result = await backend.listForStore(profile.storeId);
      else if (profile.role === "delivery") {
        const [available, mine] = await Promise.all([
          backend.listAvailableForDelivery(),
          backend.listForPartner(profile.partnerId ?? profile.id),
        ]);
        const seen = new Set<string>();
        result = [...mine, ...available].filter((o) => (seen.has(o.id) ? false : (seen.add(o.id), true)));
      } else if (profile.role === "admin") result = await backend.listAll();
      setOrders(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useEffect(() => {
    const unsubscribe = backend.subscribe(() => load());
    return unsubscribe;
  }, [load]);

  const placeOrder = useCallback(
    async (input: CreateOrderInput) => {
      if (!profile) return null;
      const res = await backend.createOrder(profile, input);
      if (res.error) {
        setError(res.error);
        return null;
      }
      await load();
      return res.order ?? null;
    },
    [profile, load],
  );

  const updateStatus = useCallback(
    async (orderId: string, to: OrderStatus) => {
      if (!profile) return false;
      const res = await backend.updateStatus(orderId, to, profile);
      if (res.error) {
        setError(res.error);
        return false;
      }
      await load();
      return true;
    },
    [profile, load],
  );

  const claimDelivery = useCallback(
    async (orderId: string) => {
      if (!profile) return false;
      const res = await backend.claimDelivery(orderId, profile);
      if (res.error) {
        setError(res.error);
        return false;
      }
      await load();
      return true;
    },
    [profile, load],
  );

  const value = useMemo<OrdersState>(
    () => ({ orders, loading, error, refresh: load, placeOrder, updateStatus, claimDelivery }),
    [orders, loading, error, load, placeOrder, updateStatus, claimDelivery],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used inside OrdersProvider");
  return ctx;
}
