import { useState } from "react";
import http from "../api/http";

const CheckoutPage = () => {
  const [form, setForm] = useState({
    shippingName: "",
    shippingEmail: "",
    shippingPhone: "",
    shippingAddress: "",
    paymentMethod: "card",
    cardHolderName: "",
    cardNumber: ""
  });
  const [message, setMessage] = useState("");
  const [checkoutResult, setCheckoutResult] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await http.post("/orders/checkout", form);
      setCheckoutResult(data);
      setMessage(`Order #${data.id} created successfully.`);
      setForm({
        shippingName: "",
        shippingEmail: "",
        shippingPhone: "",
        shippingAddress: "",
        paymentMethod: "card",
        cardHolderName: "",
        cardNumber: ""
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Checkout failed.");
    }
  };

  return (
    <div className="page-grid">
      <form className="panel form-grid" onSubmit={handleSubmit}>
        <div className="section-header">
          <div>
            <p className="eyebrow">Checkout</p>
            <h2>Delivery details</h2>
          </div>
        </div>

        <input placeholder="Full name" value={form.shippingName} onChange={(e) => setForm((current) => ({ ...current, shippingName: e.target.value }))} />
        <input type="email" placeholder="Email" value={form.shippingEmail} onChange={(e) => setForm((current) => ({ ...current, shippingEmail: e.target.value }))} />
        <input placeholder="Phone" value={form.shippingPhone} onChange={(e) => setForm((current) => ({ ...current, shippingPhone: e.target.value }))} />
        <textarea placeholder="Delivery address" value={form.shippingAddress} onChange={(e) => setForm((current) => ({ ...current, shippingAddress: e.target.value }))} rows="5" />
        <div className="inline-grid">
          <select value={form.paymentMethod} onChange={(e) => setForm((current) => ({ ...current, paymentMethod: e.target.value }))}>
            <option value="card">Card</option>
            <option value="instant_eft">Instant EFT</option>
            <option value="capitec_pay">Capitec Pay</option>
            <option value="payshap">PayShap</option>
            <option value="manual_eft">Manual EFT / Bank Transfer</option>
            <option value="cash">Cash</option>
          </select>
          <input placeholder="Card holder name" value={form.cardHolderName} onChange={(e) => setForm((current) => ({ ...current, cardHolderName: e.target.value }))} disabled={form.paymentMethod !== "card"} />
        </div>
        <input
          placeholder="Test card number (use one ending in 42 or 4242)"
          value={form.cardNumber}
          onChange={(e) => setForm((current) => ({ ...current, cardNumber: e.target.value }))}
          disabled={form.paymentMethod !== "card"}
        />
        <p className="muted">Simulated payments approve card numbers ending in `42` or `4242`. Instant EFT, Capitec Pay, PayShap, and cash are auto-approved in demo mode. Manual EFT waits for admin verification.</p>
        <button type="submit">Place order</button>
        {message ? <p className="muted">{message}</p> : null}
      </form>

      {checkoutResult?.bankDetails ? (
        <section className="panel">
          <p className="eyebrow">South Africa Payment</p>
          <h2>Manual EFT instructions</h2>
          <div className="list-stack">
            <article className="list-item"><strong>Bank</strong><span>{checkoutResult.bankDetails.bankName}</span></article>
            <article className="list-item"><strong>Account Name</strong><span>{checkoutResult.bankDetails.accountName}</span></article>
            <article className="list-item"><strong>Account Number</strong><span>{checkoutResult.bankDetails.accountNumber}</span></article>
            <article className="list-item"><strong>Branch Code</strong><span>{checkoutResult.bankDetails.branchCode}</span></article>
            <article className="list-item"><strong>Reference</strong><span>{checkoutResult.bankDetails.paymentReference}</span></article>
          </div>
          <p className="muted">{checkoutResult.paymentInstructions}</p>
        </section>
      ) : null}
    </div>
  );
};

export default CheckoutPage;
