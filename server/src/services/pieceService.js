import { pieceRepository } from "../repositories/pieceRepository.js";

export const pieceService = {
  createPieces: async ({ projectId, pieces }) =>
    pieceRepository.createMany(
      pieces.map((piece) => ({
        projectId,
        name: piece.name,
        width: piece.width,
        height: piece.height,
        quantity: piece.quantity,
        grainDirection: piece.grainDirection,
        edgingTop: piece.edgingTop,
        edgingBottom: piece.edgingBottom,
        edgingLeft: piece.edgingLeft,
        edgingRight: piece.edgingRight
      }))
    ),

  listPieces: (projectId) => pieceRepository.findByProjectId(projectId)
};
