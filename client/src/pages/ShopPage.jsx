import { useEffect, useMemo, useState } from "react";
import http from "../api/http";
import { getServerBaseUrl } from "../utils/urls";

const serverBaseUrl = getServerBaseUrl();

const ProductCard = ({ product, onAdd }) => {
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
          <span>{product.stock_quantity} in stock</span>
        </div>
        <button type="button" onClick={() => onAdd(product.id)}>Add to cart</button>
      </div>
    </article>
  );
};

const ShopPage = () => {
  const [catalog, setCatalog] = useState({ products: [], categories: [] });
  const [filters, setFilters] = useState({ search: "", category: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    http.get(`/products?${params.toString()}`).then(({ data }) => setCatalog(data));
  }, [filters]);

  const filteredCount = useMemo(() => catalog.products.length, [catalog.products]);

  const addToCart = async (productId) => {
    try {
      await http.post("/cart/items", { productId, quantity: 1 });
      setMessage("Product added to cart.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to add product.");
    }
  };

  return (
    <div className="page-grid">
      <section className="hero-card">
        <p className="eyebrow">Shop</p>
        <h2>Workshop-ready products</h2>
        <p className="muted">Browse stocked items, filter by category, and send them straight into checkout.</p>
      </section>

      <section className="panel filter-bar">
        <input
          placeholder="Search products"
          value={filters.search}
          onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))}
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters((current) => ({ ...current, category: e.target.value }))}
        >
          <option value="">All categories</option>
          {catalog.categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <div className="filter-summary">{filteredCount} products</div>
      </section>

      {message ? <p className="muted">{message}</p> : null}

      <section className="product-grid">
        {catalog.products.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={addToCart} />
        ))}
      </section>
    </div>
  );
};

export default ShopPage;
