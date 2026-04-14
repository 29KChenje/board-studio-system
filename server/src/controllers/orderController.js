import { orderService } from "../services/orderService.js";

export const orderController = {
  createWorkshop: async (req, res) => {
    const order = await orderService.createWorkshopOrder({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json(order);
  },

  checkout: async (req, res) => {
    const order = await orderService.checkoutCart({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json(order);
  },

  list: async (_req, res) => {
    const orders = await orderService.listOrders();
    res.json(orders);
  },

  mine: async (req, res) => {
    const orders = await orderService.getMyOrders(req.user.id);
    res.json(orders);
  },

  updateStatus: async (req, res) => {
    const order = await orderService.updateOrderStatus({
      orderId: Number(req.params.id),
      status: req.body.status
    });
    res.json(order);
  },

  uploadProof: async (req, res) => {
    const order = await orderService.uploadPaymentProof({
      orderId: Number(req.params.id),
      userId: req.user.id,
      paymentId: Number(req.body.paymentId),
      customerReference: req.body.customerReference || "",
      filePath: req.file ? `/uploads/${req.file.filename}` : null
    });
    res.json(order);
  },

  verifyPayment: async (req, res) => {
    const order = await orderService.verifyManualPayment({
      orderId: Number(req.params.id),
      paymentId: Number(req.body.paymentId),
      verifiedByUserId: req.user.id
    });
    res.json(order);
  }
};
