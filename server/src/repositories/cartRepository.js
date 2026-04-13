import { documentRef } from "../config/db.js";
import {
  createDocument,
  deleteDocument,
  getDocumentsByField,
  sortByCreatedDesc,
  updateDocument
} from "./firestoreRepositoryUtils.js";
import { productRepository } from "./productRepository.js";

export const cartRepository = {
  findOrCreateByUserId: async (userId) => {
    const carts = await getDocumentsByField("carts", "user_id", Number(userId));
    const existing = sortByCreatedDesc(carts)[0];

    if (existing) {
      return existing;
    }

    return createDocument("carts", "carts", {
      user_id: Number(userId)
    });
  },

  getDetailedCart: async (userId) => {
    const cart = await cartRepository.findOrCreateByUserId(userId);
    const cartItems = await getDocumentsByField("cartItems", "cart_id", Number(cart.id));
    const products = await Promise.all(cartItems.map((item) => productRepository.findById(item.product_id)));
    const productMap = new Map(products.filter(Boolean).map((product) => [Number(product.id), product]));

    const items = sortByCreatedDesc(cartItems)
      .map((item) => {
        const product = productMap.get(Number(item.product_id));
        if (!product) return null;

        return {
          id: item.id,
          cart_id: item.cart_id,
          product_id: item.product_id,
          quantity: item.quantity,
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          image_url: product.image_url,
          stock_quantity: product.stock_quantity
        };
      })
      .filter(Boolean);

    return { ...cart, items };
  },

  upsertItem: async ({ cartId, productId, quantity }, connection = null) => {
    const items = await getDocumentsByField("cartItems", "cart_id", Number(cartId));
    const existing = items.find((item) => Number(item.product_id) === Number(productId));

    if (existing) {
      await updateDocument("cartItems", existing.id, { quantity: Number(quantity) }, connection);
      return;
    }

    await createDocument(
      "cartItems",
      "cartItems",
      {
        cart_id: Number(cartId),
        product_id: Number(productId),
        quantity: Number(quantity)
      },
      connection
    );
  },

  removeItem: async (cartId, itemId, connection = null) => {
    const items = await getDocumentsByField("cartItems", "cart_id", Number(cartId));
    const target = items.find((entry) => Number(entry.id) === Number(itemId));
    if (!target) return;
    await deleteDocument("cartItems", target.id, connection);
  },

  clear: async (cartId, connection = null) => {
    const items = await getDocumentsByField("cartItems", "cart_id", Number(cartId));

    if (connection) {
      items.forEach((item) => {
        connection.delete(documentRef("cartItems", item.id));
      });
      return;
    }

    await Promise.all(items.map((item) => deleteDocument("cartItems", item.id)));
  }
};
