export const pieceModel = {
  toDomain: (row) => ({
    id: row.id,
    projectId: row.project_id ?? row.projectId,
    name: row.name,
    width: Number(row.width),
    height: Number(row.height),
    quantity: Number(row.quantity),
    grainDirection: row.grain_direction ?? row.grainDirection,
    edgingTop: Number(row.edging_top ?? row.edgingTop ?? 0),
    edgingBottom: Number(row.edging_bottom ?? row.edgingBottom ?? 0),
    edgingLeft: Number(row.edging_left ?? row.edgingLeft ?? 0),
    edgingRight: Number(row.edging_right ?? row.edgingRight ?? 0),
    createdAt: row.created_at ?? row.createdAt ?? null
  })
};
