import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import http from "../api/http";
import StatCard from "../components/StatCard";
import { useAuth } from "../contexts/AuthContext";
import { persistProjectId } from "../utils/projectSelection";
import { getServerBaseUrl } from "../utils/urls";

const serverBaseUrl = getServerBaseUrl();

const FeaturedProductCard = ({ product }) => {
  // Generate a consistent placeholder image based on product ID
  const getPlaceholderImage = (productId) => {
    // Use Lorem Picsum with consistent seeds for each product
    return `https://picsum.photos/seed/${productId}/400/300`;
  };

  // Check if image_url is a full URL or a local path
  const getImageSrc = (imageUrl, productId) => {
    if (!imageUrl) return getPlaceholderImage(productId);
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `${serverBaseUrl}${imageUrl}`;
  };

  return (
    <article className="product-card">
      <div className="product-image">
        <img
          src={getImageSrc(product.image_url, product.id)}
          alt={product.name}
          onError={(e) => {
            // Fallback to a generic placeholder if the image fails to load
            e.target.src = `https://picsum.photos/400/300?random=${product.id}`;
          }}
        />
      </div>
      <div className="product-content">
        <p className="eyebrow">{product.category || "Workshop Product"}</p>
        <h3>{product.name}</h3>
        <p className="muted">{product.description}</p>
        <div className="product-meta">
          <strong>R {product.price}</strong>
          <span>{product.stock_quantity} available</span>
        </div>
      </div>
    </article>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [orders, setOrders] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      http.get("/projects/mine").then(({ data }) => setProjects(data)).catch(() => setProjects([])),
      http.get("/orders/mine").then(({ data }) => setOrders(data)).catch(() => setOrders([])),
      http.get("/products").then(({ data }) => setCatalog(data.products || [])).catch(() => setCatalog([]))
    ]).finally(() => setIsLoading(false));
  }, []);

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);
  const featuredProducts = useMemo(() => catalog.slice(0, 3), [catalog]);

  const openProjectWorkspace = (projectId, target) => {
    persistProjectId(projectId);
    navigate(`/${target}?projectId=${projectId}`);
  };

  return (
    <div className="page-grid">
      <section className="hero-card">
        <p className="eyebrow">Dashboard</p>
        <h2>Hello, {user?.name}</h2>
        <p className="muted">Track dimensions, piece schedules, optimization performance, and project-ready quotes from one screen.</p>
      </section>

      <section className="stats-grid">
        <StatCard label="Projects" value={projects.length} hint="Customer-linked projects in your workspace" />
        <StatCard label="Orders" value={orders.length} hint="Workshop and shop orders linked to your account" />
        <StatCard label="Default Board" value="2750 x 1830" hint="Standard production sheet size in millimeters" />
        <StatCard label="Rotation Logic" value="Grain-aware" hint="Flexible grain pieces may rotate during optimization" />
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Quick Start</p>
            <h2>Customer workflow</h2>
          </div>
        </div>
        <div className="action-row">
          <Link to="/projects/new"><button type="button">Create project</button></Link>
          <Link to="/shop"><button type="button" className="secondary-button dark-button">Browse shop</button></Link>
          <Link to="/cart"><button type="button" className="secondary-button dark-button">Open cart</button></Link>
          <Link to="/orders"><button type="button" className="secondary-button dark-button">Track orders</button></Link>
        </div>
        <div className="list-stack top-gap">
          <article className="list-item">
            <div className="list-item-body">
              <strong>1. Create a board-cutting project</strong>
              <span>Enter your cabinet dimensions and let the system generate panels automatically.</span>
            </div>
          </article>
          <article className="list-item">
            <div className="list-item-body">
              <strong>2. Review the cutting layout</strong>
              <span>Check optimized board usage, export PDFs, and open the 3D cabinet preview.</span>
            </div>
          </article>
          <article className="list-item">
            <div className="list-item-body">
              <strong>3. Place a workshop or shop order</strong>
              <span>Request cutting services or add stocked products to the cart for checkout.</span>
            </div>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Recent Projects</p>
            <h2>Workspace activity</h2>
          </div>
        </div>
        <div className="list-stack">
          {projects.map((project) => (
            <article className="list-item" key={project.id}>
              <div className="list-item-body">
                <strong>{project.name}</strong>
                <span>{project.width} x {project.height} x {project.depth} mm</span>
              </div>
              <div className="action-row">
                <button type="button" className="secondary-button dark-button" onClick={() => openProjectWorkspace(project.id, "cutting-list")}>
                  Cutting List
                </button>
                <button type="button" className="secondary-button dark-button" onClick={() => openProjectWorkspace(project.id, "viewer")}>
                  3D Viewer
                </button>
              </div>
            </article>
          ))}
          {isLoading ? <p className="muted">Loading your workspace activity...</p> : null}
          {!isLoading && !projects.length ? <p className="muted">No projects yet. Create one to generate pieces and quotes.</p> : null}
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Recent Orders</p>
            <h2>Order tracking</h2>
          </div>
          <Link to="/orders" className="muted">View all</Link>
        </div>
        <div className="list-stack">
          {recentOrders.map((order) => (
            <article className="list-item" key={order.id}>
              <div className="list-item-body">
                <strong>Order #{order.id}</strong>
                <span>{order.order_type} | {order.status} | payment {order.payment_status}</span>
              </div>
              <strong>R {order.total_cost}</strong>
            </article>
          ))}
          {!isLoading && !recentOrders.length ? <p className="muted">No orders yet. Your workshop requests and shop orders will appear here.</p> : null}
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Sample Products</p>
            <h2>See what customers can order</h2>
          </div>
          <Link to="/shop" className="muted">Open full shop</Link>
        </div>
        <section className="product-grid">
          {featuredProducts.map((product) => (
            <FeaturedProductCard key={product.id} product={product} />
          ))}
        </section>
        {!isLoading && !featuredProducts.length ? <p className="muted">Sample products will appear here once the backend is running.</p> : null}
      </section>
    </div>
  );
};

export default DashboardPage;
