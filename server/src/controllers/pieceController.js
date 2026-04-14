import { pieceService } from "../services/pieceService.js";

export const pieceController = {
  create: async (req, res) => {
    const pieces = await pieceService.createPieces(req.body);
    res.status(201).json(pieces);
  },

  listByProject: async (req, res) => {
    const pieces = await pieceService.listPieces(req.params.projectId);
    res.json(pieces);
  }
};
