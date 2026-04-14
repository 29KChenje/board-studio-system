import {
  createDocument,
  findDocumentById,
  getDocumentsByField,
  listDocuments,
  sortByCreatedDesc,
  sortByIdAsc,
  updateDocument
} from "./firestoreRepositoryUtils.js";
import { projectRepository } from "./projectRepository.js";
import { userRepository } from "./userRepository.js";

const attachOrderRelations = async (order) => {
  if (!order) return null;

  const [project, user] = await Promise.all([
    order.project_id ? projectRepository.findById(order.project_id) : Promise.resolve(null),
    userRepository.findById(order.user_id)
  ]);

  return {
    ...order,
    project_name: project?.name || null,
    customer_name: user?.name || null,
    customer_email: user?.email || null
  };
};

export const orderRepository = {
  create: async ({
    userId,
    projectId = null,
    orderType,
    totalCost,
    status,
    quoteJson,
    shippingName = null,
    shippingEmail = null,
    shippingPhone = null,
    shippingAddress = null,
    paymentStatus = "pending",
    paymentReference = null,
    paymentMethod = null,
    paymentAmount = null
  }, connection = null) => {
    const order = await createDocument(
      "orders",
      "orders",
      {
        user_id: Number(userId),
        project_id: projectId ? Number(projectId) : null,
        order_type: orderType,
        total_cost: Number(totalCost),
        status,
        quote_json: quoteJson,
        shipping_name: shippingName,
        shipping_email: shippingEmail,
        shipping_phone: shippingPhone,
        shipping_address: shippingAddress,
        payment_status: paymentStatus,
        payment_reference: paymentReference,
        payment_method: paymentMethod,
        payment_amount: paymentAmount === null ? null : Number(paymentAmount)
      },
      connection
    );

    return {
      id: order.id,
      userId: order.user_id,
      projectId: order.project_id,
      orderType: order.order_type,
      totalCost: order.total_cost,
      status: order.status,
      quote: quoteJson,
      shippingName: order.shipping_name,
      shippingEmail: order.shipping_email,
      shippingPhone: order.shipping_phone,
      shippingAddress: order.shipping_address,
      paymentStatus: order.payment_status,
      paymentReference: order.payment_reference,
      paymentMethod: order.payment_method,
      paymentAmount: order.payment_amount
    };
  },

  createItems: async (orderId, items, connection = null) => {
    if (!items.length) return [];

    const created = [];
    for (const item of items) {
      created.push(
        await createDocument(
          "orderItems",
          "orderItems",
          {
            order_id: Number(orderId),
            product_id: Number(item.productId),
            product_name: item.productName,
            unit_price: Number(item.unitPrice),
            quantity: Number(item.quantity),
            line_total: Number(item.lineTotal)
          },
          connection
        )
      );
    }

    return sortByIdAsc(created);
  },

  findItemsByOrderId: async (orderId) => {
    const items = await getDocumentsByField("orderItems", "order_id", Number(orderId));
    return sortByIdAsc(items);
  },

  findItemsByOrderIds: async (orderIds) => {
    if (!orderIds.length) return [];
    const items = await listDocuments("orderItems");
    return sortByIdAsc(items.filter((item) => orderIds.includes(Number(item.order_id))));
  },

  findAll: async () => {
    const orders = sortByCreatedDesc(await listDocuments("orders"));
    return Promise.all(orders.map(attachOrderRelations));
  },

  findAllDetailed: async () => {
    const orders = sortByCreatedDesc(await listDocuments("orders"));
    return Promise.all(orders.map(attachOrderRelations));
  },

  findAllByUserIdDetailed: async (userId) => {
    const orders = await getDocumentsByField("orders", "user_id", Number(userId));
    return Promise.all(sortByCreatedDesc(orders).map(attachOrderRelations));
  },

  findById: async (id) => attachOrderRelations(await findDocumentById("orders", id)),

  findOwnerIdByOrderId: async (id) => {
    const order = await findDocumentById("orders", id);
    return order?.user_id || null;
  },

  updatePayment: async ({ id, paymentStatus, paymentReference, paymentMethod, paymentAmount, status }, connection = null) => {
    const updated = await updateDocument(
      "orders",
      id,
      {
        payment_status: paymentStatus,
        payment_reference: paymentReference,
        payment_method: paymentMethod,
        payment_amount: paymentAmount === null ? null : Number(paymentAmount),
        status
      },
      connection
    );

    return connection ? updated : orderRepository.findById(id);
  },

  updateStatus: async ({ id, status }, connection = null) => {
    const updated = await updateDocument("orders", id, { status }, connection);
    return connection ? updated : orderRepository.findById(id);
  },

  updatePaymentState: async ({ id, paymentStatus, status }, connection = null) => {
    const updated = await updateDocument(
      "orders",
      id,
      {
        payment_status: paymentStatus,
        status
      },
      connection
    );

    return connection ? updated : orderRepository.findById(id);
  }
};
