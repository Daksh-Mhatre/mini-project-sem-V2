import { Outlet } from "react-router-dom";
import { findStore } from "../../data/stores";
import { useAuth } from "../../context/AuthContext";
import { RoleTopBar } from "./RoleTopBar";

export function StoreLayout() {
  const { profile } = useAuth();
  const store = findStore(profile?.storeId ?? "freshmart");
  return (
    <div className="min-h-screen bg-surface">
      <RoleTopBar title={`${store.name} · Partner dashboard`} subtitle="Supermarket order management" />
      <main className="mx-auto max-w-7xl px-4 py-5"><Outlet /></main>
    </div>
  );
}

export function DeliveryLayout() {
  const { profile } = useAuth();
  return (
    <div className="min-h-screen bg-surface">
      <RoleTopBar title={`${profile?.name ?? "Delivery partner"} · Delivery app`} subtitle="Accept and complete deliveries" />
      <main className="mx-auto max-w-7xl px-4 py-5"><Outlet /></main>
    </div>
  );
}

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <RoleTopBar title="Padosi Admin" subtitle="Platform-wide operations overview" />
      <main className="mx-auto max-w-7xl px-4 py-5"><Outlet /></main>
    </div>
  );
}
