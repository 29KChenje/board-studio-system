export const orderModel = {
  toDomain: (row) => ({
    id: row.id,
    userId: row.user_id ?? row.userId,
    projectId: row.project_id ?? row.projectId ?? null,
    orderType: row.order_type ?? row.orderType,
    totalCost: Number(row.total_cost ?? row.totalCost),
    status: row.status,
    paymentStatus: row.payment_status ?? row.paymentStatus ?? "pending",
    paymentReference: row.payment_reference ?? row.paymentReference ?? null,
    paymentMethod: row.payment_method ?? row.paymentMethod ?? null,
    paymentAmount: row.payment_amount ? Number(row.payment_amount) : null,
    shippingName: row.shipping_name ?? row.shippingName ?? null,
    shippingEmail: row.shipping_email ?? row.shippingEmail ?? null,
    shippingPhone: row.shipping_phone ?? row.shippingPhone ?? null,
    shippingAddress: row.shipping_address ?? row.shippingAddress ?? null,
    projectName: row.project_name ?? row.projectName ?? null,
    customerName: row.customer_name ?? row.customerName ?? null,
    customerEmail: row.customer_email ?? row.customerEmail ?? null,
    quote: typeof row.quote_json === "string" ? JSON.parse(row.quote_json) : (row.quote_json ?? null),
    createdAt: row.created_at ?? row.createdAt ?? null
  }),

  itemToDomain: (row) => ({
    id: row.id,
    orderId: row.order_id ?? row.orderId,
    productId: row.product_id ?? row.productId,
    productName: row.product_name ?? row.productName,
    unitPrice: Number(row.unit_price ?? row.unitPrice),
    quantity: Number(row.quantity),
    lineTotal: Number(row.line_total ?? row.lineTotal)
  })
};
