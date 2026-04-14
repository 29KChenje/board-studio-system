export const cartModel = {
  toDomain: (row) => ({
    id: row.id,
    userId: row.user_id ?? row.userId,
    createdAt: row.created_at ?? row.createdAt ?? null,
    updatedAt: row.updated_at ?? row.updatedAt ?? null
  }),

  itemToDomain: (row) => ({
    id: row.id,
    cartId: row.cart_id ?? row.cartId,
    productId: row.product_id ?? row.productId,
    quantity: Number(row.quantity),
    name: row.name,
    description: row.description ?? "",
    category: row.category ?? "",
    price: Number(row.price),
    imageUrl: row.image_url ?? row.imageUrl ?? null,
    stockQuantity: Number(row.stock_quantity ?? row.stockQuantity ?? 0)
  })
};
