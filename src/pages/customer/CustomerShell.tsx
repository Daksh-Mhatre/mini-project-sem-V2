import { Outlet } from "react-router-dom";
import { OrdersProvider } from "../../context/OrdersContext";
import { ProtectedRoute } from "../../router/ProtectedRoute";
import { CustomerHeader, BottomNav, FloatingCartBar } from "../../components/customer/Navigation";
import { Toast } from "../../components/ui/Feedback";
import { useApp } from "../../context/AppContext";

/** Layout + guard for every /customer/* route. */
export function CustomerShell() {
  const { toast } = useApp();
  return (
    <ProtectedRoute role="customer">
      <OrdersProvider>
        <div className="min-h-screen">
          <CustomerHeader />
          <main className="mx-auto max-w-7xl px-4 py-5 pb-40 md:pb-10">
            <Outlet />
          </main>
          <FloatingCartBar />
          <BottomNav />
          <Toast message={toast} />
        </div>
      </OrdersProvider>
    </ProtectedRoute>
  );
}
