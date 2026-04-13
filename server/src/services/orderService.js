import { withTransaction } from "../config/db.js";
import { cartRepository } from "../repositories/cartRepository.js";
import { orderRepository } from "../repositories/orderRepository.js";
import { paymentRepository } from "../repositories/paymentRepository.js";
import { pieceRepository } from "../repositories/pieceRepository.js";
import { productRepository } from "../repositories/productRepository.js";
import { projectRepository } from "../repositories/projectRepository.js";
import { ApiError } from "../utils/ApiError.js";
import { requireFields } from "../utils/validators.js";
import { notificationService } from "./notificationService.js";
import { optimizationService } from "./optimizationService.js";
import { paymentGatewayService } from "./paymentGatewayService.js";
import { pricingService } from "./pricingService.js";

const hydrateOrders = async (orders) => {
  if (!orders.length) return [];
  const orderIds = orders.map((order) => order.id);
  const [allItems, allPayments] = await Promise.all([
    orderRepository.findItemsByOrderIds(orderIds),
    paymentRepository.findByOrderIds(orderIds)
  ]);
  const itemsByOrderId = new Map();
  const paymentsByOrderId = new Map();

  allItems.forEach((item) => {
    const list = itemsByOrderId.get(item.order_id) || [];
    list.push(item);
    itemsByOrderId.set(item.order_id, list);
  });

  allPayments.forEach((payment) => {
    const list = paymentsByOrderId.get(payment.order_id) || [];
    list.push(payment);
    paymentsByOrderId.set(payment.order_id, list);
  });

  return orders.map((order) => ({
    ...order,
    items: itemsByOrderId.get(order.id) || [],
    payments: paymentsByOrderId.get(order.id) || []
  }));
};

export const orderService = {
  createWorkshopOrder: async ({ userId, projectId, status = "quoted" }) => {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    if (Number(project.user_id) !== Number(userId)) {
      throw new ApiError(403, "You cannot create a workshop order for another customer's project");
    }

    const pieces = await pieceRepository.findByProjectId(projectId);
    if (!pieces.length) {
      throw new ApiError(400, "Project must contain pieces before creating an order");
    }

    const optimization = optimizationService.optimize({
      pieces,
      boardWidth: project.board_width,
      boardHeight: project.board_height
    });
    const quote = pricingService.buildQuote({ pieces, optimization });

    return orderRepository.create({
      userId,
      projectId,
      orderType: "workshop",
      totalCost: quote.totalCost,
      status,
      quoteJson: { optimization, quote }
    });
  },

  checkoutCart: async ({
    userId,
    shippingName,
    shippingEmail,
    shippingPhone,
    shippingAddress,
    paymentMethod = "card",
    cardNumber = "",
    cardHolderName = ""
  }) => {
    requireFields(
      { shippingName, shippingEmail, shippingAddress },
      ["shippingName", "shippingEmail", "shippingAddress"]
    );

    const cart = await cartRepository.getDetailedCart(userId);
    if (!cart.items.length) {
      throw new ApiError(400, "Your cart is empty");
    }

    const transactionResult = await withTransaction(async (connection) => {
      const lockedProducts = await productRepository.findByIdsForUpdate(
        cart.items.map((item) => item.product_id),
        connection
      );
      const productMap = new Map(lockedProducts.map((product) => [Number(product.id), product]));

      const items = cart.items.map((item) => {
        const product = productMap.get(Number(item.product_id));
        if (!product) {
          throw new ApiError(404, `Product ${item.name} no longer exists`);
        }
        if (Number(item.quantity) > Number(product.stock_quantity)) {
          throw new ApiError(400, `Insufficient stock for ${item.name}`);
        }

        return {
          productId: item.product_id,
          productName: item.name,
          unitPrice: Number(product.price),
          quantity: Number(item.quantity),
          lineTotal: Number((Number(product.price) * Number(item.quantity)).toFixed(2))
        };
      });

      const totalCost = Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
      const isManualEft = paymentMethod === "manual_eft";
      const paymentAttempt = isManualEft
        ? {
            provider: "manual-bank-transfer",
            method: paymentMethod,
            amount: totalCost,
            status: "awaiting_confirmation",
            message: "Awaiting manual EFT confirmation",
            providerResponse: null,
            referenceCode: null
          }
        : await paymentGatewayService.charge({
            amount: totalCost,
            method: paymentMethod,
            cardNumber,
            cardHolderName
          });

      if (!isManualEft && paymentAttempt.status !== "paid") {
        throw new ApiError(402, paymentAttempt.message, { paymentReference: paymentAttempt.referenceCode });
      }

      const order = await orderRepository.create({
        userId,
        projectId: null,
        orderType: "shop",
        totalCost,
        status: isManualEft ? "awaiting_payment_confirmation" : "completed",
        quoteJson: { cartSummary: { totalItems: items.reduce((sum, item) => sum + item.quantity, 0) } },
        shippingName,
        shippingEmail,
        shippingPhone,
        shippingAddress,
        paymentStatus: paymentAttempt.status,
        paymentReference: paymentAttempt.referenceCode,
        paymentMethod: paymentAttempt.method,
        paymentAmount: paymentAttempt.amount
      }, connection);

      const saBankDetails = isManualEft
        ? paymentGatewayService.buildSouthAfricaBankDetails(order.id)
        : null;

      if (isManualEft) {
        await orderRepository.updatePayment({
          id: order.id,
          paymentStatus: "awaiting_confirmation",
          paymentReference: saBankDetails.paymentReference,
          paymentMethod: paymentMethod,
          paymentAmount: totalCost,
          status: "awaiting_payment_confirmation"
        }, connection);
      }

      await orderRepository.createItems(order.id, items, connection);

      await paymentRepository.create({
        orderId: order.id,
        userId,
        provider: paymentAttempt.provider,
        referenceCode: paymentAttempt.referenceCode || saBankDetails.paymentReference,
        amount: paymentAttempt.amount,
        method: paymentAttempt.method,
        status: paymentAttempt.status,
        customerReference: saBankDetails?.paymentReference || null,
        providerResponse: paymentAttempt.providerResponse
      }, connection);

      if (!isManualEft) {
        await notificationService.sendPaymentReceipt({
          orderId: order.id,
          email: shippingEmail,
          phone: shippingPhone,
          referenceCode: paymentAttempt.referenceCode
        });

        await Promise.all(
          items.map((item) => productRepository.adjustStockWithConnection(item.productId, -item.quantity, connection))
        );

        await cartRepository.clear(cart.id, connection);
      }

      return {
        orderId: order.id,
        isManualEft,
        bankDetails: saBankDetails
      };
    });

    const hydrated = (await hydrateOrders([await orderRepository.findById(transactionResult.orderId)]))[0];
    return transactionResult.isManualEft
      ? {
          ...hydrated,
          bankDetails: transactionResult.bankDetails,
          paymentInstructions:
            "Use the payment reference exactly as shown and upload proof of payment after transfer."
        }
      : hydrated;
  },

  listOrders: async () => {
    const orders = await orderRepository.findAllDetailed();
    return hydrateOrders(orders);
  },

  getMyOrders: async (userId) => {
    const orders = await orderRepository.findAllByUserIdDetailed(userId);
    return hydrateOrders(orders);
  },

  updateOrderStatus: async ({ orderId, status }) => {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    const updated = await orderRepository.updateStatus({ id: orderId, status });
    await notificationService.sendOrderUpdate({
      orderId,
      email: updated.customer_email || updated.shipping_email,
      phone: updated.shipping_phone,
      message: `Order ${orderId} status updated to ${status}`
    });
    return (await hydrateOrders([updated]))[0];
  },

  uploadPaymentProof: async ({ orderId, userId, paymentId, filePath, customerReference }) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");
    if (Number(order.user_id) !== Number(userId)) {
      throw new ApiError(403, "You do not have permission to upload proof for this order");
    }

    const payments = await paymentRepository.findByOrderId(orderId);
    const payment = payments.find((entry) => Number(entry.id) === Number(paymentId));
    if (!payment) throw new ApiError(404, "Payment record not found");

    await paymentRepository.attachProof({
      id: paymentId,
      proofOfPaymentUrl: filePath,
      customerReference
    });
    const updatedOrder = await orderRepository.updatePaymentState({
      id: orderId,
      paymentStatus: "awaiting_confirmation",
      status: "awaiting_payment_confirmation"
    });
    return (await hydrateOrders([updatedOrder]))[0];
  },

  verifyManualPayment: async ({ orderId, paymentId, verifiedByUserId }) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    const payments = await paymentRepository.findByOrderId(orderId);
    const payment = payments.find((entry) => Number(entry.id) === Number(paymentId));
    if (!payment) throw new ApiError(404, "Payment record not found");
    if (!["awaiting_confirmation", "pending"].includes(payment.status)) {
      throw new ApiError(400, "Payment is not awaiting manual verification");
    }

    const items = await orderRepository.findItemsByOrderId(orderId);

    const transactionResult = await withTransaction(async (connection) => {
      const lockedProducts = await productRepository.findByIdsForUpdate(
        items.map((item) => item.product_id),
        connection
      );
      const productMap = new Map(lockedProducts.map((product) => [Number(product.id), product]));

      items.forEach((item) => {
        const product = productMap.get(Number(item.product_id));
        if (!product || Number(item.quantity) > Number(product.stock_quantity)) {
          throw new ApiError(400, `Insufficient stock to verify payment for ${item.product_name}`);
        }
      });

      await paymentRepository.verifyPayment({
        id: paymentId,
        verifiedByUserId,
        status: "paid",
        providerResponse: { verifiedManually: true }
      }, connection);
      await orderRepository.updatePaymentState({
        id: orderId,
        paymentStatus: "paid",
        status: "completed"
      }, connection);

      await Promise.all(
        items.map((item) => productRepository.adjustStockWithConnection(item.product_id, -item.quantity, connection))
      );

      const cart = await cartRepository.findOrCreateByUserId(order.user_id);
      await cartRepository.clear(cart.id, connection);

      await notificationService.sendPaymentReceipt({
        orderId,
        email: order.customer_email || order.shipping_email,
        phone: order.shipping_phone,
        referenceCode: payment.reference_code
      });

      return { orderId };
    });

    return (await hydrateOrders([await orderRepository.findById(transactionResult.orderId)]))[0];
  }
};
