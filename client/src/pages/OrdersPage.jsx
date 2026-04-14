import { useEffect, useState } from "react";
import http from "../api/http";

const downloadPdf = async (url, filename) => {
  const response = await http.get(url, { responseType: "blob" });
  const blobUrl = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(blobUrl);
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  const loadOrders = () => {
    http.get("/orders/mine").then(({ data }) => setOrders(data)).catch(() => setOrders([]));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const uploadProof = async (orderId, paymentId, file) => {
    try {
      const formData = new FormData();
      formData.append("paymentId", paymentId);
      formData.append("customerReference", `Customer proof for order ${orderId}`);
      formData.append("proof", file);
      await http.post(`/orders/${orderId}/payment-proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMessage(`Proof of payment uploaded for order #${orderId}.`);
      loadOrders();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to upload proof.");
    }
  };

  return (
    <div className="page-grid">
      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Orders</p>
            <h2>Your order history</h2>
          </div>
        </div>
        {message ? <p className="muted">{message}</p> : null}
        <div className="list-stack">
          {orders.map((order) => (
            <article className="list-item order-card" key={order.id}>
              <div>
                <strong>Order #{order.id}</strong>
                <span>{order.order_type} | {order.status} | payment {order.payment_status}</span>
                <span>R {order.total_cost}</span>
                {order.payment_method === "manual_eft" ? <span>Use bank reference: {order.payment_reference}</span> : null}
              </div>
              <div className="action-row">
                <button type="button" className="secondary-button dark-button" onClick={() => downloadPdf(`/exports/orders/${order.id}/invoice.pdf`, `invoice-${order.id}.pdf`)}>
                  Invoice PDF
                </button>
                <button type="button" className="secondary-button dark-button" onClick={() => downloadPdf(`/exports/orders/${order.id}/receipt.pdf`, `receipt-${order.id}.pdf`)}>
                  Receipt PDF
                </button>
                {order.payment_status === "awaiting_confirmation" || order.status === "awaiting_payment_confirmation" ? (
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      const paymentId = order.payments?.[0]?.id;
                      if (file && paymentId) {
                        uploadProof(order.id, paymentId, file);
                      }
                    }}
                  />
                ) : null}
              </div>
            </article>
          ))}
          {!orders.length ? <p className="muted">No orders yet. Create a workshop request or shop checkout to see history here.</p> : null}
        </div>
      </section>
    </div>
  );
};

export default OrdersPage;
