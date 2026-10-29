import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { OrdersProvider } from "./context/OrdersContext";
import { ProtectedRoute } from "./router/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { CustomerShell } from "./pages/customer/CustomerShell";
import { HomePage } from "./pages/customer/HomePage";
import { SearchPage } from "./pages/customer/SearchPage";
import { CategoriesPage } from "./pages/customer/CategoryPages";
import { CategoryRoute, ProductRoute, TrackingRoute } from "./pages/customer/CategoryRouteParams";
import { CartPage } from "./pages/customer/CartPage";
import { CheckoutPage } from "./pages/customer/CheckoutPage";
import { OrdersPage, ProfilePage } from "./pages/customer/AccountPages";
import { StoreLayout, DeliveryLayout, AdminLayout } from "./components/layout/RoleLayouts";
import { StoreDashboard } from "./pages/StoreDashboard";
import { DeliveryDashboard } from "./pages/DeliveryDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";

function StoreArea() {
  return (
    <ProtectedRoute role="store">
      <OrdersProvider>
        <StoreLayout />
      </OrdersProvider>
    </ProtectedRoute>
  );
}

function DeliveryArea() {
  return (
    <ProtectedRoute role="delivery">
      <OrdersProvider>
        <DeliveryLayout />
      </OrdersProvider>
    </ProtectedRoute>
  );
}

function AdminArea() {
  return (
    <ProtectedRoute role="admin">
      <OrdersProvider>
        <AdminLayout />
      </OrdersProvider>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />

            <Route path="/customer" element={<CustomerShell />}>
              <Route index element={<HomePage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="category/:id" element={<CategoryRoute />} />
              <Route path="product/:id" element={<ProductRoute />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="tracking/:id" element={<TrackingRoute />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            <Route path="/store" element={<StoreArea />}>
              <Route index element={<StoreDashboard />} />
            </Route>

            <Route path="/delivery" element={<DeliveryArea />}>
              <Route index element={<DeliveryDashboard />} />
            </Route>

            <Route path="/admin" element={<AdminArea />}>
              <Route index element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </HashRouter>
      </AppProvider>
    </AuthProvider>
  );
}
