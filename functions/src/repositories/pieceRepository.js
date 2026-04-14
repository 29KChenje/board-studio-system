import { createDocument, getDocumentsByField, sortByIdAsc } from "./firestoreRepositoryUtils.js";

export const pieceRepository = {
  createMany: async (pieces) => {
    if (!pieces.length) return [];

    const created = [];
    for (const piece of pieces) {
      created.push(
        await createDocument("pieces", "pieces", {
          project_id: Number(piece.projectId),
          name: piece.name,
          width: Number(piece.width),
          height: Number(piece.height),
          quantity: Number(piece.quantity),
          grain_direction: piece.grainDirection,
          edging_top: Number(piece.edgingTop),
          edging_bottom: Number(piece.edgingBottom),
          edging_left: Number(piece.edgingLeft),
          edging_right: Number(piece.edgingRight)
        })
      );
    }

    return sortByIdAsc(created);
  },

  findByProjectId: async (projectId) => {
    const pieces = await getDocumentsByField("pieces", "project_id", Number(projectId));
    return sortByIdAsc(pieces);
  }
};
