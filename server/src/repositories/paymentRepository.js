import {
  createDocument,
  findDocumentById,
  getDocumentsByField,
  listDocuments,
  sortByCreatedDesc,
  updateDocument
} from "./firestoreRepositoryUtils.js";

const sortPayments = (payments) =>
  [...payments].sort((left, right) => {
    if (left.order_id !== right.order_id) {
      return Number(left.order_id) - Number(right.order_id);
    }
    return String(right.created_at || "").localeCompare(String(left.created_at || ""));
  });

export const paymentRepository = {
  create: async ({
    orderId,
    userId,
    provider = "simulated",
    referenceCode,
    amount,
    currency = "ZAR",
    method = "card",
    status = "pending",
    customerReference = null,
    proofOfPaymentUrl = null,
    providerResponse = null
  }, connection = null) => {
    const payment = await createDocument("payments", "payments", {
      order_id: Number(orderId),
      user_id: Number(userId),
      provider,
      reference_code: referenceCode,
      amount: Number(amount),
      currency,
      method,
      status,
      customer_reference: customerReference,
      proof_of_payment_url: proofOfPaymentUrl,
      provider_response: providerResponse,
      verified_at: null,
      verified_by_user_id: null
    }, connection);

    return payment;
  },

  findById: async (id, connection = null) => findDocumentById("payments", id, connection),

  findByOrderId: async (orderId) => {
    const payments = await getDocumentsByField("payments", "order_id", Number(orderId));
    return sortByCreatedDesc(payments);
  },

  findByOrderIds: async (orderIds) => {
    if (!orderIds.length) return [];
    const payments = await listDocuments("payments");
    return sortPayments(payments.filter((payment) => orderIds.includes(Number(payment.order_id))));
  },

  updateStatus: async ({ id, status, providerResponse }, connection = null) =>
    updateDocument(
      "payments",
      id,
      {
        status,
        provider_response: providerResponse
      },
      connection
    ),

  attachProof: async ({ id, proofOfPaymentUrl, customerReference }, connection = null) =>
    updateDocument(
      "payments",
      id,
      {
        proof_of_payment_url: proofOfPaymentUrl,
        customer_reference: customerReference
      },
      connection
    ),

  verifyPayment: async ({ id, verifiedByUserId, status = "paid", providerResponse = null }, connection = null) =>
    updateDocument(
      "payments",
      id,
      {
        status,
        provider_response: providerResponse,
        verified_at: new Date().toISOString(),
        verified_by_user_id: Number(verifiedByUserId)
      },
      connection
    )
};
