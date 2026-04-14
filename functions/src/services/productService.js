import { productRepository } from "../repositories/productRepository.js";
import { ApiError } from "../utils/ApiError.js";
import { ensureNonNegativeInteger, ensurePositiveNumber, requireFields } from "../utils/validators.js";

export const productService = {
  listProducts: ({ search, category, isAdmin }) =>
    productRepository.list({ search, category, onlyActive: !isAdmin }),

  getProductCatalog: async ({ search, category, isAdmin }) => {
    const [products, categories] = await Promise.all([
      productService.listProducts({ search, category, isAdmin }),
      productRepository.categories()
    ]);

    return {
      products,
      categories: categories.map((item) => item.category)
    };
  },

  createProduct: async ({ name, description, category, price, stockQuantity, imageUrl }) => {
    requireFields({ name, price, stockQuantity }, ["name", "price", "stockQuantity"]);
    ensurePositiveNumber(price, "price");
    ensureNonNegativeInteger(stockQuantity, "stockQuantity");

    return productRepository.create({
      name,
      description: description || "",
      category: category || "",
      price: Number(price),
      imageUrl: imageUrl || null,
      stockQuantity: Number(stockQuantity),
      isActive: 1
    });
  },

  updateProduct: async (id, payload) => {
    const existing = await productRepository.findById(id);
    if (!existing) throw new ApiError(404, "Product not found");

    const merged = {
      ...existing,
      ...payload,
      imageUrl: payload.imageUrl ?? existing.image_url
    };

    ensurePositiveNumber(merged.price, "price");
    ensureNonNegativeInteger(merged.stockQuantity ?? merged.stock_quantity, "stockQuantity");

    return productRepository.update({
      id,
      name: merged.name,
      description: merged.description,
      category: merged.category,
      price: Number(merged.price),
      imageUrl: merged.imageUrl,
      stockQuantity: Number(merged.stockQuantity ?? merged.stock_quantity),
      isActive: Number(merged.isActive ?? merged.is_active ?? 1)
    });
  },

  deleteProduct: async (id) => {
    const existing = await productRepository.findById(id);
    if (!existing) throw new ApiError(404, "Product not found");
    await productRepository.delete(id);
  }
};
