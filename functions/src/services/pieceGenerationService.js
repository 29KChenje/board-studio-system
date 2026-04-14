export const pieceGenerationService = {
  generateCabinetPieces: ({ width, height, depth }) => [
    {
      name: "Left Side Panel",
      width: depth,
      height,
      quantity: 1,
      grainDirection: "fixed",
      edgingTop: 1,
      edgingBottom: 1,
      edgingLeft: 0,
      edgingRight: 1
    },
    {
      name: "Right Side Panel",
      width: depth,
      height,
      quantity: 1,
      grainDirection: "fixed",
      edgingTop: 1,
      edgingBottom: 1,
      edgingLeft: 1,
      edgingRight: 0
    },
    {
      name: "Top Panel",
      width,
      height: depth,
      quantity: 1,
      grainDirection: "flexible",
      edgingTop: 1,
      edgingBottom: 0,
      edgingLeft: 1,
      edgingRight: 1
    },
    {
      name: "Bottom Panel",
      width,
      height: depth,
      quantity: 1,
      grainDirection: "flexible",
      edgingTop: 0,
      edgingBottom: 1,
      edgingLeft: 1,
      edgingRight: 1
    },
    {
      name: "Back Panel",
      width,
      height,
      quantity: 1,
      grainDirection: "fixed",
      edgingTop: 0,
      edgingBottom: 0,
      edgingLeft: 0,
      edgingRight: 0
    }
  ]
};
