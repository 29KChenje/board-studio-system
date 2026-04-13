import { useEffect, useMemo, useState } from "react";
import http from "../api/http";
import StatCard from "../components/StatCard";

const initialForm = {
  name: "",
  description: "",
  category: "",
  price: "",
  stockQuantity: "",
  isActive: "1",
  image: null
};

const MetricBar = ({ label, value, max }) => (
  <div className="metric-bar-row">
    <div className="metric-bar-head">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
    <div className="metric-bar-track">
      <div className="metric-bar-fill" style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
    </div>
  </div>
);

const AnalyticsPanel = ({ eyebrow, title, entries, max, formatValue }) => (
  <section className="panel">
    <p className="eyebrow">{eyebrow}</p>
    <h2>{title}</h2>
    <div className="chart-stack">
      {entries.map(([label, value]) => (
        <MetricBar key={label} label={label} value={formatValue ? formatValue(value) : value} max={max} />
      ))}
      {!entries.length ? <p className="muted">No data available yet.</p> : null}
    </div>
  </section>
);

const ProductForm = ({
  form,
  editingProductId,
  message,
  onSubmit,
  onChange,
  onFileChange,
  onCancelEdit
}) => (
  <section className="panel">
    <p className="eyebrow">{editingProductId ? "Edit Product" : "Create Product"}</p>
    <h2>Catalog management</h2>
    <form className="form-grid" onSubmit={onSubmit}>
      <div className="inline-grid">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(event) => onChange("name", event.target.value)}
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(event) => onChange("category", event.target.value)}
        />
      </div>

      <textarea
        placeholder="Description"
        rows="4"
        value={form.description}
        onChange={(event) => onChange("description", event.target.value)}
      />

      <div className="inline-grid">
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(event) => onChange("price", event.target.value)}
        />
        <input
          type="number"
          placeholder="Stock quantity"
          value={form.stockQuantity}
          onChange={(event) => onChange("stockQuantity", event.target.value)}
        />
        <select value={form.isActive} onChange={(event) => onChange("isActive", event.target.value)}>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
      </div>

      <input type="file" accept="image/*" onChange={onFileChange} />

      <div className="action-row">
        <button type="submit">{editingProductId ? "Update product" : "Save product"}</button>
        {editingProductId ? (
          <button type="button" className="secondary-button dark-button" onClick={onCancelEdit}>
            Cancel edit
          </button>
        ) : null}
      </div>

      {message ? <p className="muted">{message}</p> : null}
    </form>
  </section>
);

const ProductList = ({ products, onEdit, onDelete }) => (
  <section className="panel">
    <p className="eyebrow">Products</p>
    <h2>Catalog inventory</h2>
    <div className="list-stack">
      {products.map((product) => (
        <article className="list-item" key={product.id}>
          <div>
            <strong>{product.name}</strong>
            <span>
              {product.category || "General"} | R {product.price} | stock {product.stock_quantity}
            </span>
          </div>
          <div className="action-row">
            <button type="button" className="secondary-button dark-button" onClick={() => onEdit(product)}>
              Edit
            </button>
            <button type="button" className="secondary-button dark-button" onClick={() => onDelete(product.id)}>
              Delete
            </button>
          </div>
        </article>
      ))}
      {!products.length ? <p className="muted">No products in the catalog yet.</p> : null}
    </div>
  </section>
);

const SimpleListPanel = ({ eyebrow, title, items, emptyMessage, renderItem }) => (
  <section className="panel">
    <p className="eyebrow">{eyebrow}</p>
    <h2>{title}</h2>
    <div className="list-stack">
      {items.map(renderItem)}
      {!items.length ? <p className="muted">{emptyMessage}</p> : null}
    </div>
  </section>
);

const SystemHealthPanel = ({ systemHealth }) => (
  <section className="panel">
    <p className="eyebrow">System Health</p>
    <h2>Runtime snapshot</h2>
    {systemHealth ? (
      <div className="list-stack">
        <article className="list-item">
          <strong>Status</strong>
          <span>{systemHealth.status}</span>
        </article>
        <article className="list-item">
          <strong>Uptime</strong>
          <span>{systemHealth.uptimeSeconds}s</span>
        </article>
        <article className="list-item">
          <strong>Timestamp</strong>
          <span>{systemHealth.timestamp}</span>
        </article>
      </div>
    ) : (
      <p className="muted">System health unavailable.</p>
    )}
  </section>
);

const buildChartData = (source, sortEntries = false) => {
  const entries = Object.entries(source || {});
  const normalizedEntries = sortEntries
    ? entries.sort(([left], [right]) => left.localeCompare(right))
    : entries;

  return {
    entries: normalizedEntries,
    max: Math.max(...normalizedEntries.map(([, value]) => Number(value)), 1)
  };
};

const AdminPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);

  const loadDashboard = async () => {
    try {
      const [{ data: dashboardData }, { data: systemHealthData }] = await Promise.all([
        http.get("/admin/dashboard"),
        http.get("/admin/system-health")
      ]);
      setDashboard(dashboardData);
      setSystemHealth(systemHealthData);
    } catch (_error) {
      setDashboard(null);
      setSystemHealth(null);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const statusChart = useMemo(
    () => buildChartData(dashboard?.analytics?.ordersByStatus),
    [dashboard]
  );

  const revenueChart = useMemo(
    () => buildChartData(dashboard?.analytics?.monthlyRevenue, true),
    [dashboard]
  );

  const typeChart = useMemo(
    () => buildChartData(dashboard?.analytics?.ordersByType),
    [dashboard]
  );

  const handleFieldChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingProductId(null);
  };

  const submitProduct = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("price", Number(form.price));
      formData.append("stockQuantity", Number(form.stockQuantity));
      formData.append("isActive", Number(form.isActive));

      if (form.image) {
        formData.append("image", form.image);
      }

      if (editingProductId) {
        await http.put(`/products/${editingProductId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setMessage("Product updated.");
      } else {
        await http.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setMessage("Product created.");
      }

      resetForm();
      await loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save product.");
    }
  };

  const editProduct = (product) => {
    setEditingProductId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      category: product.category || "",
      price: String(product.price ?? ""),
      stockQuantity: String(product.stock_quantity ?? ""),
      isActive: String(product.is_active),
      image: null
    });
    setMessage("");
  };

  const deleteProduct = async (id) => {
    try {
      await http.delete(`/products/${id}`);
      setMessage("Product deleted.");

      if (editingProductId === id) {
        resetForm();
      }

      await loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to delete product.");
    }
  };

  if (!dashboard) {
    return (
      <div className="panel">
        <p className="muted">Admin dashboard data unavailable.</p>
      </div>
    );
  }

  return (
    <div className="page-grid">
      <section className="stats-grid">
        <StatCard label="Customers" value={dashboard.metrics.customers} hint="Registered customer accounts" />
        <StatCard label="Projects" value={dashboard.metrics.projects} hint="Projects created across the system" />
        <StatCard label="Orders" value={dashboard.metrics.orders} hint="Workshop and shop orders" />
        <StatCard label="Products" value={dashboard.metrics.products} hint="Catalog items currently stored" />
        <StatCard label="Revenue" value={`R ${dashboard.metrics.revenue}`} hint="Total order and quote value" />
      </section>

      <section className="admin-grid">
        <ProductForm
          form={form}
          editingProductId={editingProductId}
          message={message}
          onSubmit={submitProduct}
          onChange={handleFieldChange}
          onFileChange={(event) => handleFieldChange("image", event.target.files?.[0] || null)}
          onCancelEdit={resetForm}
        />

        <AnalyticsPanel
          eyebrow="Analytics"
          title="Order status mix"
          entries={statusChart.entries}
          max={statusChart.max}
        />
      </section>

      <section className="admin-grid">
        <AnalyticsPanel
          eyebrow="Revenue Trend"
          title="Monthly revenue"
          entries={revenueChart.entries}
          max={revenueChart.max}
          formatValue={(value) => Number(value).toFixed(2)}
        />

        <AnalyticsPanel
          eyebrow="Order Mix"
          title="By order type"
          entries={typeChart.entries}
          max={typeChart.max}
        />
      </section>

      <section className="admin-grid">
        <SimpleListPanel
          eyebrow="Low Stock"
          title="Attention needed"
          items={dashboard.analytics.lowStockProducts}
          emptyMessage="No low-stock products right now."
          renderItem={(product) => (
            <article className="list-item" key={product.id}>
              <strong>{product.name}</strong>
              <span>{product.stock_quantity} units left</span>
            </article>
          )}
        />

        <SystemHealthPanel systemHealth={systemHealth} />
      </section>

      <SimpleListPanel
        eyebrow="Materials"
        title="Stock overview"
        items={dashboard.boards}
        emptyMessage="No board stock records available."
        renderItem={(board) => (
          <article className="list-item" key={board.id}>
            <strong>{board.material}</strong>
            <span>
              {board.width} x {board.height} mm | stock {board.stock_quantity}
            </span>
          </article>
        )}
      />

      <ProductList products={dashboard.products} onEdit={editProduct} onDelete={deleteProduct} />
    </div>
  );
};

export default AdminPage;
