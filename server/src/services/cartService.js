import { cartRepository } from "../repositories/cartRepository.js";
import { productRepository } from "../repositories/productRepository.js";
import { ApiError } from "../utils/ApiError.js";
import { ensurePositiveNumber } from "../utils/validators.js";

const summarizeCart = (cart) => {
  const items = cart.items.map((item) => ({
    ...item,
    lineTotal: Number((Number(item.price) * Number(item.quantity)).toFixed(2))
  }));
  const totalItems = items.reduce((sum, item) => sum + Number(item.quantity), 0);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    ...cart,
    items,
    summary: {
      totalItems,
      subtotal: Number(subtotal.toFixed(2))
    }
  };
};

export const cartService = {
  getCart: async (userId) => summarizeCart(await cartRepository.getDetailedCart(userId)),

  addItem: async ({ userId, productId, quantity }) => {
    ensurePositiveNumber(quantity, "quantity");
    const product = await productRepository.findById(productId);
    if (!product || !product.is_active) throw new ApiError(404, "Product not found");

    const cart = await cartRepository.findOrCreateByUserId(userId);
    const current = await cartRepository.getDetailedCart(userId);
    const existingItem = current.items.find((item) => Number(item.product_id) === Number(productId));
    const nextQuantity = Number(quantity) + Number(existingItem?.quantity || 0);

    if (nextQuantity > Number(product.stock_quantity)) {
      throw new ApiError(400, "Requested quantity exceeds available stock");
    }

    await cartRepository.upsertItem({
      cartId: cart.id,
      productId,
      quantity: nextQuantity
    });

    return cartService.getCart(userId);
  },

  updateItem: async ({ userId, itemId, quantity }) => {
    ensurePositiveNumber(quantity, "quantity");
    const cart = await cartRepository.getDetailedCart(userId);
    const item = cart.items.find((entry) => Number(entry.id) === Number(itemId));
    if (!item) throw new ApiError(404, "Cart item not found");
    if (Number(quantity) > Number(item.stock_quantity)) {
      throw new ApiError(400, "Requested quantity exceeds available stock");
    }

    await cartRepository.upsertItem({
      cartId: cart.id,
      productId: item.product_id,
      quantity: Number(quantity)
    });

    return cartService.getCart(userId);
  },

  removeItem: async ({ userId, itemId }) => {
    const cart = await cartRepository.findOrCreateByUserId(userId);
    await cartRepository.removeItem(cart.id, itemId);
    return cartService.getCart(userId);
  },

  clearCart: async (userId) => {
    const cart = await cartRepository.findOrCreateByUserId(userId);
    await cartRepository.clear(cart.id);
    return cartService.getCart(userId);
  }
};
