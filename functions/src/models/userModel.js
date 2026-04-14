export const userModel = {
  toPublic: (row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at ?? row.createdAt ?? null
  })
};
