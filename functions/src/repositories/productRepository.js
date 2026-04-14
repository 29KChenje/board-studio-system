import { documentRef } from "../config/db.js";
import {
  createDocument,
  deleteDocument,
  findDocumentById,
  listDocuments,
  sortByCreatedDesc,
  updateDocument
} from "./firestoreRepositoryUtils.js";

export const productRepository = {
  create: async ({ name, description, category, price, imageUrl, stockQuantity, isActive = 1 }) => {
    const product = await createDocument("products", "products", {
      name,
      description: description || "",
      category: category || "",
      price: Number(price),
      image_url: imageUrl || "",
      stock_quantity: Number(stockQuantity),
      is_active: Number(isActive)
    });

    return productRepository.findById(product.id);
  },

  update: async ({ id, name, description, category, price, imageUrl, stockQuantity, isActive }) => {
    await updateDocument("products", id, {
      name,
      description: description || "",
      category: category || "",
      price: Number(price),
      image_url: imageUrl || "",
      stock_quantity: Number(stockQuantity),
      is_active: Number(isActive)
    });

    return productRepository.findById(id);
  },

  delete: async (id) => {
    await deleteDocument("products", id);
  },

  findById: async (id) => findDocumentById("products", id),

  findByIdsForUpdate: async (ids, connection) => {
    if (!ids.length) return [];
    const uniqueIds = [...new Set(ids.map(Number))];
    const rows = await Promise.all(
      uniqueIds.map(async (id) => {
        const snapshot = await connection.get(documentRef("products", id));
        return snapshot.exists ? snapshot.data() : null;
      })
    );

    return rows.filter(Boolean);
  },

  list: async ({ search = "", category = "", onlyActive = true }) => {
    const normalizedSearch = search.trim().toLowerCase();
    const products = sortByCreatedDesc(await listDocuments("products"));

    return products.filter((product) => {
      if (onlyActive && Number(product.is_active) !== 1) {
        return false;
      }

      if (category && product.category !== category) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = `${product.name || ""} ${product.description || ""}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  },

  adjustStock: async (id, delta) => {
    const product = await productRepository.findById(id);
    if (!product) return null;

    const nextStock = Math.max(Number(product.stock_quantity) + Number(delta), 0);
    await updateDocument("products", id, { stock_quantity: nextStock });
    return productRepository.findById(id);
  },

  adjustStockWithConnection: async (id, delta, connection) => {
    const ref = documentRef("products", id);
    const snapshot = await connection.get(ref);
    if (!snapshot.exists) return null;

    const product = snapshot.data();
    const nextStock = Math.max(Number(product.stock_quantity) + Number(delta), 0);
    const updated = {
      ...product,
      stock_quantity: nextStock
    };

    connection.set(
      ref,
      {
        stock_quantity: nextStock,
        updated_at: new Date().toISOString()
      },
      { merge: true }
    );

    return updated;
  },

  categories: async () => {
    const products = await listDocuments("products");
    return [...new Set(products.map((product) => product.category).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );
  }
};
