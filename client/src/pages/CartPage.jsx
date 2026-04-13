import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import http from "../api/http";

const CartPage = () => {
  const [cart, setCart] = useState({ items: [], summary: { totalItems: 0, subtotal: 0 } });

  const loadCart = () => {
    http.get("/cart").then(({ data }) => setCart(data));
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (itemId, quantity) => {
    await http.put(`/cart/items/${itemId}`, { quantity: Number(quantity) });
    loadCart();
  };

  const removeItem = async (itemId) => {
    await http.delete(`/cart/items/${itemId}`);
    loadCart();
  };

  return (
    <div className="page-grid">
      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Cart</p>
            <h2>Order summary</h2>
          </div>
          <strong>{cart.summary.totalItems} items</strong>
        </div>

        <div className="list-stack">
          {cart.items.map((item) => (
            <article className="list-item cart-item" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span>{item.category || "General"} | R {item.price}</span>
              </div>
              <div className="cart-actions">
                <input
                  type="number"
                  min="1"
                  max={item.stock_quantity}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, e.target.value)}
                />
                <strong>R {item.lineTotal}</strong>
                <button type="button" className="secondary-button dark-button" onClick={() => removeItem(item.id)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
          {!cart.items.length ? <p className="muted">Your cart is empty. Visit the shop to add products.</p> : null}
        </div>
      </section>

      <section className="panel checkout-summary">
        <p className="eyebrow">Checkout</p>
        <h2>Total</h2>
        <strong className="checkout-total">R {cart.summary.subtotal}</strong>
        <Link to="/checkout">
          <button type="button" disabled={!cart.items.length}>Proceed to checkout</button>
        </Link>
      </section>
    </div>
  );
};

export default CartPage;
