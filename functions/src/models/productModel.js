export const productModel = {
  toDomain: (row) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    category: row.category ?? "",
    price: Number(row.price),
    imageUrl: row.image_url ?? row.imageUrl ?? null,
    stockQuantity: Number(row.stock_quantity ?? row.stockQuantity ?? 0),
    isActive: Boolean(Number(row.is_active ?? row.isActive ?? 0)),
    createdAt: row.created_at ?? row.createdAt ?? null,
    updatedAt: row.updated_at ?? row.updatedAt ?? null
  })
};
