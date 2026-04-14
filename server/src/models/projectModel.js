export const projectModel = {
  toDomain: (row) => ({
    id: row.id,
    userId: row.user_id ?? row.userId,
    name: row.name,
    width: Number(row.width),
    height: Number(row.height),
    depth: Number(row.depth),
    boardWidth: Number(row.board_width ?? row.boardWidth),
    boardHeight: Number(row.board_height ?? row.boardHeight),
    material: row.material,
    customerName: row.customer_name ?? row.customerName ?? null,
    customerEmail: row.customer_email ?? row.customerEmail ?? null,
    createdAt: row.created_at ?? row.createdAt ?? null
  })
};
