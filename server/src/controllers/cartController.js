import { cartService } from "../services/cartService.js";

export const cartController = {
  get: async (req, res) => {
    const cart = await cartService.getCart(req.user.id);
    res.json(cart);
  },

  addItem: async (req, res) => {
    const cart = await cartService.addItem({
      userId: req.user.id,
      productId: Number(req.body.productId),
      quantity: Number(req.body.quantity)
    });
    res.status(201).json(cart);
  },

  updateItem: async (req, res) => {
    const cart = await cartService.updateItem({
      userId: req.user.id,
      itemId: Number(req.params.itemId),
      quantity: Number(req.body.quantity)
    });
    res.json(cart);
  },

  removeItem: async (req, res) => {
    const cart = await cartService.removeItem({
      userId: req.user.id,
      itemId: Number(req.params.itemId)
    });
    res.json(cart);
  }
};
