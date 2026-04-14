import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const area = (rect) => rect.width * rect.height;

const expandPieces = (pieces) =>
  pieces.flatMap((piece) =>
    Array.from({ length: Number(piece.quantity) }, (_, index) => ({
      key: `${piece.id || piece.name}-${index + 1}`,
      id: piece.id || null,
      name: piece.name,
      sourceWidth: Number(piece.width),
      sourceHeight: Number(piece.height),
      grainDirection: piece.grain_direction || piece.grainDirection || "fixed",
      edgingTop: Number(piece.edging_top ?? piece.edgingTop ?? 0),
      edgingBottom: Number(piece.edging_bottom ?? piece.edgingBottom ?? 0),
      edgingLeft: Number(piece.edging_left ?? piece.edgingLeft ?? 0),
      edgingRight: Number(piece.edging_right ?? piece.edgingRight ?? 0)
    }))
  );

const sortPieces = (pieces) =>
  [...pieces].sort((a, b) =>
    area({ width: b.sourceWidth, height: b.sourceHeight }) - area({ width: a.sourceWidth, height: a.sourceHeight }) ||
    b.sourceHeight - a.sourceHeight ||
    b.sourceWidth - a.sourceWidth
  );

const buildOrientations = (piece) => {
  const orientations = [
    {
      rotated: false,
      width: piece.sourceWidth,
      height: piece.sourceHeight
    }
  ];

  if (
    piece.grainDirection !== "fixed" &&
    piece.sourceWidth !== piece.sourceHeight
  ) {
    orientations.push({
      rotated: true,
      width: piece.sourceHeight,
      height: piece.sourceWidth
    });
  }

  return orientations;
};

const scorePlacement = (freeRect, orientation) => {
  const leftoverWidth = freeRect.width - orientation.width;
  const leftoverHeight = freeRect.height - orientation.height;
  const shortSideFit = Math.min(leftoverWidth, leftoverHeight);
  const longSideFit = Math.max(leftoverWidth, leftoverHeight);
  return {
    shortSideFit,
    longSideFit,
    wasteArea: area(freeRect) - area(orientation)
  };
};

const chooseBestPlacement = (piece, freeRects) => {
  let best = null;

  freeRects.forEach((freeRect, freeRectIndex) => {
    buildOrientations(piece).forEach((orientation) => {
      if (orientation.width > freeRect.width || orientation.height > freeRect.height) {
        return;
      }

      const score = scorePlacement(freeRect, orientation);
      const candidate = { freeRect, freeRectIndex, orientation, score };

      if (
        !best ||
        score.shortSideFit < best.score.shortSideFit ||
        (score.shortSideFit === best.score.shortSideFit && score.longSideFit < best.score.longSideFit) ||
        (score.shortSideFit === best.score.shortSideFit &&
          score.longSideFit === best.score.longSideFit &&
          score.wasteArea < best.score.wasteArea)
      ) {
        best = candidate;
      }
    });
  });

  return best;
};

const splitFreeRect = (freeRect, orientation) => {
  const horizontalRemainder = freeRect.width - orientation.width;
  const verticalRemainder = freeRect.height - orientation.height;

  const splitHorizontally = horizontalRemainder <= verticalRemainder;
  const newRects = [];

  if (splitHorizontally) {
    newRects.push({
      x: freeRect.x + orientation.width,
      y: freeRect.y,
      width: horizontalRemainder,
      height: freeRect.height
    });
    newRects.push({
      x: freeRect.x,
      y: freeRect.y + orientation.height,
      width: orientation.width,
      height: verticalRemainder
    });
  } else {
    newRects.push({
      x: freeRect.x + orientation.width,
      y: freeRect.y,
      width: horizontalRemainder,
      height: orientation.height
    });
    newRects.push({
      x: freeRect.x,
      y: freeRect.y + orientation.height,
      width: freeRect.width,
      height: verticalRemainder
    });
  }

  return newRects.filter((rect) => rect.width > 0 && rect.height > 0);
};

const rectContains = (a, b) =>
  b.x >= a.x &&
  b.y >= a.y &&
  b.x + b.width <= a.x + a.width &&
  b.y + b.height <= a.y + a.height;

const pruneFreeRects = (freeRects) =>
  freeRects.filter(
    (rect, index) =>
      !freeRects.some((other, otherIndex) => otherIndex !== index && rectContains(other, rect))
  );

const packBoard = (pieces, boardWidth, boardHeight, boardLabel) => {
  const freeRects = [{ x: 0, y: 0, width: boardWidth, height: boardHeight }];
  const placements = [];
  const remaining = [...pieces];

  while (remaining.length) {
    let chosen = null;
    let chosenPieceIndex = -1;

    remaining.forEach((piece, pieceIndex) => {
      const candidate = chooseBestPlacement(piece, freeRects);
      if (!candidate) return;

      if (
        !chosen ||
        candidate.score.shortSideFit < chosen.score.shortSideFit ||
        (candidate.score.shortSideFit === chosen.score.shortSideFit &&
          candidate.score.longSideFit < chosen.score.longSideFit)
      ) {
        chosen = candidate;
        chosenPieceIndex = pieceIndex;
      }
    });

    if (!chosen) {
      break;
    }

    const piece = remaining[chosenPieceIndex];
    placements.push({
      key: piece.key,
      pieceId: piece.id,
      name: piece.name,
      x: chosen.freeRect.x,
      y: chosen.freeRect.y,
      width: chosen.orientation.width,
      height: chosen.orientation.height,
      rotated: chosen.orientation.rotated,
      grainDirection: piece.grainDirection,
      edgingTop: piece.edgingTop,
      edgingBottom: piece.edgingBottom,
      edgingLeft: piece.edgingLeft,
      edgingRight: piece.edgingRight
    });

    freeRects.splice(chosen.freeRectIndex, 1, ...splitFreeRect(chosen.freeRect, chosen.orientation));
    const nextFreeRects = pruneFreeRects(freeRects).sort((a, b) => area(a) - area(b));
    freeRects.length = 0;
    freeRects.push(...nextFreeRects);
    remaining.splice(chosenPieceIndex, 1);
  }

  const usedArea = placements.reduce((sum, placement) => sum + area(placement), 0);
  const totalArea = boardWidth * boardHeight;
  const wasteArea = totalArea - usedArea;

  return {
    board: boardLabel,
    boardWidth,
    boardHeight,
    placements,
    freeRects,
    usedArea,
    wasteArea,
    wastePercentage: Number(((wasteArea / totalArea) * 100).toFixed(2)),
    utilizationRate: Number(((usedArea / totalArea) * 100).toFixed(2)),
    remaining
  };
};

const validateFit = (piece, boardWidth, boardHeight) => {
  const normalFit = piece.sourceWidth <= boardWidth && piece.sourceHeight <= boardHeight;
  const rotatedFit = piece.sourceHeight <= boardWidth && piece.sourceWidth <= boardHeight;

  if (!normalFit && (piece.grainDirection === "fixed" || !rotatedFit)) {
    throw new ApiError(400, `Piece "${piece.name}" does not fit inside the selected board size`);
  }
};

export const optimizationService = {
  optimize: ({ pieces, boardWidth, boardHeight }) => {
    if (!pieces?.length) {
      throw new ApiError(400, "At least one piece is required for optimization");
    }

    const normalizedBoardWidth = Number(boardWidth) || env.defaults.boardWidth;
    const normalizedBoardHeight = Number(boardHeight) || env.defaults.boardHeight;
    const expanded = sortPieces(expandPieces(pieces));

    expanded.forEach((piece) => validateFit(piece, normalizedBoardWidth, normalizedBoardHeight));

    const boards = [];
    let remaining = [...expanded];
    let boardCount = 0;

    while (remaining.length) {
      boardCount += 1;
      const board = packBoard(remaining, normalizedBoardWidth, normalizedBoardHeight, `Board ${boardCount}`);

      if (!board.placements.length) {
        throw new ApiError(400, "Unable to place remaining pieces on any board");
      }

      boards.push({
        board: board.board,
        boardWidth: board.boardWidth,
        boardHeight: board.boardHeight,
        placements: board.placements,
        freeRects: board.freeRects,
        usedArea: board.usedArea,
        wasteArea: board.wasteArea,
        wastePercentage: board.wastePercentage,
        utilizationRate: board.utilizationRate
      });
      remaining = board.remaining;
    }

    const totalBoardArea = boards.length * normalizedBoardWidth * normalizedBoardHeight;
    const totalUsedArea = boards.reduce((sum, board) => sum + board.usedArea, 0);
    const totalWasteArea = totalBoardArea - totalUsedArea;

    return {
      boardCount: boards.length,
      boardWidth: normalizedBoardWidth,
      boardHeight: normalizedBoardHeight,
      totalUsedArea,
      totalWasteArea,
      totalWastePercentage: Number(((totalWasteArea / totalBoardArea) * 100).toFixed(2)),
      boards
    };
  }
};
