import { env } from "../config/env.js";

const edgeMetersForPiece = (piece) => {
  const edgingLeft = Number(piece.edging_left ?? piece.edgingLeft ?? 0);
  const edgingRight = Number(piece.edging_right ?? piece.edgingRight ?? 0);
  const edgingTop = Number(piece.edging_top ?? piece.edgingTop ?? 0);
  const edgingBottom = Number(piece.edging_bottom ?? piece.edgingBottom ?? 0);
  const verticalEdges = (edgingLeft + edgingRight) * Number(piece.height);
  const horizontalEdges = (edgingTop + edgingBottom) * Number(piece.width);
  return ((verticalEdges + horizontalEdges) * Number(piece.quantity)) / 1000;
};

export const pricingService = {
  summarizeEdging: (pieces) => {
    const totalEdgeMeters = pieces.reduce((sum, piece) => sum + edgeMetersForPiece(piece), 0);
    return Number(totalEdgeMeters.toFixed(2));
  },

  buildQuote: ({ pieces, optimization }) => {
    const cutCount = pieces.reduce((sum, piece) => sum + Number(piece.quantity), 0);
    const totalEdgeMeters = pricingService.summarizeEdging(pieces);
    const boardCost = optimization.boardCount * env.defaults.boardCostPerSheet;
    const cuttingCost = cutCount * env.defaults.cutCostPerPiece;
    const edgingCost = totalEdgeMeters * env.defaults.edgeCostPerMeter;
    const totalCost = Number((boardCost + cuttingCost + edgingCost).toFixed(2));

    return {
      boardsUsed: optimization.boardCount,
      boardCost,
      cuttingCost,
      edgingCost: Number(edgingCost.toFixed(2)),
      totalEdgeMeters,
      totalCost
    };
  }
};
