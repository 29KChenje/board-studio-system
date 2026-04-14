import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AppShell = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Board Studio System</p>
          <h1>Production Floor</h1>
          <p className="muted">Furniture projects, cutting plans, pricing, and visualization in one workspace.</p>
        </div>

        <nav className="nav-list">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/projects/new">Create Project</NavLink>
          <NavLink to="/cutting-list">Cutting List</NavLink>
          <NavLink to="/viewer">3D Viewer</NavLink>
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/cart">Cart</NavLink>
          <NavLink to="/checkout">Checkout</NavLink>
          <NavLink to="/orders">Orders</NavLink>
          {user?.role === "admin" ? <NavLink to="/admin">Admin Panel</NavLink> : null}
          {user?.role === "admin" ? <NavLink to="/admin/orders">Admin Orders</NavLink> : null}
        </nav>

        <div className="user-card">
          <strong>{user?.name}</strong>
          <span>{user?.role}</span>
          <button className="secondary-button" type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
};

export default AppShell;
