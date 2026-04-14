import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./layouts/AppShell";

const AdminPage = lazy(() => import("./pages/AdminPage"));
const AdminOrdersPage = lazy(() => import("./pages/AdminOrdersPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const CreateProjectPage = lazy(() => import("./pages/CreateProjectPage"));
const CuttingListPage = lazy(() => import("./pages/CuttingListPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ShopPage = lazy(() => import("./pages/ShopPage"));
const ViewerPage = lazy(() => import("./pages/ViewerPage"));

const ShellRoute = ({ children }) => <AppShell>{children}</AppShell>;
const PageLoader = () => <div className="panel">Loading workspace...</div>;

const App = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ShellRoute>
              <DashboardPage />
            </ShellRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/new"
        element={
          <ProtectedRoute>
            <ShellRoute>
              <CreateProjectPage />
            </ShellRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cutting-list"
        element={
          <ProtectedRoute>
            <ShellRoute>
              <CuttingListPage />
            </ShellRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/viewer"
        element={
          <ProtectedRoute>
            <ShellRoute>
              <ViewerPage />
            </ShellRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop"
        element={
          <ProtectedRoute>
            <ShellRoute>
              <ShopPage />
            </ShellRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <ShellRoute>
              <CartPage />
            </ShellRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <ShellRoute>
              <CheckoutPage />
            </ShellRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <ShellRoute>
              <OrdersPage />
            </ShellRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <ShellRoute>
              <AdminPage />
            </ShellRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute roles={["admin"]}>
            <ShellRoute>
              <AdminOrdersPage />
            </ShellRoute>
          </ProtectedRoute>
        }
      />
    </Routes>
  </Suspense>
);

export default App;
