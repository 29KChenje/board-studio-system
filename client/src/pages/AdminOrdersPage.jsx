import { useEffect, useState } from "react";
import http from "../api/http";

const statuses = ["pending", "awaiting_payment_confirmation", "quoted", "approved", "in_production", "completed"];

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  const loadOrders = () => {
    http.get("/orders").then(({ data }) => setOrders(data)).catch(() => setOrders([]));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await http.patch(`/orders/${id}/status`, { status });
      setMessage(`Order #${id} updated to ${status}.`);
      loadOrders();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update order.");
    }
  };

  const verifyPayment = async (orderId, paymentId) => {
    try {
      await http.patch(`/orders/${orderId}/verify-payment`, { paymentId });
      setMessage(`Payment verified for order #${orderId}.`);
      loadOrders();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to verify payment.");
    }
  };

  return (
    <div className="page-grid">
      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Admin Orders</p>
            <h2>Manage workflow status</h2>
          </div>
        </div>
        {message ? <p className="muted">{message}</p> : null}
        <div className="list-stack">
          {orders.map((order) => (
            <article className="list-item admin-order-card" key={order.id}>
              <div>
                <strong>Order #{order.id}</strong>
                <span>{order.customer_name || order.shipping_name} | {order.order_type}</span>
                <span>R {order.total_cost} | payment {order.payment_status}</span>
                {order.payments?.[0]?.proof_of_payment_url ? <span>Proof uploaded: {order.payments[0].proof_of_payment_url}</span> : null}
              </div>
              <div className="action-row">
                <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}>
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                {order.payment_status === "awaiting_confirmation" || order.status === "awaiting_payment_confirmation" ? (
                  <button type="button" className="secondary-button dark-button" onClick={() => verifyPayment(order.id, order.payments?.[0]?.id)}>
                    Verify EFT
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminOrdersPage;
