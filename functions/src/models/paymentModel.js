export const paymentModel = {
  toDomain: (row) => ({
    id: row.id,
    orderId: row.order_id ?? row.orderId,
    userId: row.user_id ?? row.userId,
    provider: row.provider,
    referenceCode: row.reference_code ?? row.referenceCode,
    amount: Number(row.amount),
    currency: row.currency,
    method: row.method,
    status: row.status,
    providerResponse:
      typeof row.provider_response === "string"
        ? JSON.parse(row.provider_response)
        : (row.provider_response ?? null),
    createdAt: row.created_at ?? row.createdAt ?? null,
    updatedAt: row.updated_at ?? row.updatedAt ?? null
  })
};
