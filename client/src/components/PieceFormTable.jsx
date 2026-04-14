const defaultPiece = {
  name: "",
  width: "",
  height: "",
  quantity: 1,
  grainDirection: "fixed",
  edgingTop: 0,
  edgingBottom: 0,
  edgingLeft: 0,
  edgingRight: 0
};

const PieceFormTable = ({ pieces, setPieces }) => {
  const updatePiece = (index, key, value) => {
    setPieces((current) =>
      current.map((piece, pieceIndex) =>
        pieceIndex === index ? { ...piece, [key]: value } : piece
      )
    );
  };

  return (
    <div className="panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">Project Pieces</p>
          <h2>Cutting input</h2>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={() => setPieces((current) => [...current, { ...defaultPiece }])}
        >
          Add piece
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Width</th>
              <th>Height</th>
              <th>Qty</th>
              <th>Grain</th>
              <th>Top</th>
              <th>Bottom</th>
              <th>Left</th>
              <th>Right</th>
            </tr>
          </thead>
          <tbody>
            {pieces.map((piece, index) => (
              <tr key={`piece-${index + 1}`}>
                <td><input value={piece.name} onChange={(e) => updatePiece(index, "name", e.target.value)} /></td>
                <td><input type="number" value={piece.width} onChange={(e) => updatePiece(index, "width", e.target.value)} /></td>
                <td><input type="number" value={piece.height} onChange={(e) => updatePiece(index, "height", e.target.value)} /></td>
                <td><input type="number" min="1" value={piece.quantity} onChange={(e) => updatePiece(index, "quantity", e.target.value)} /></td>
                <td>
                  <select value={piece.grainDirection} onChange={(e) => updatePiece(index, "grainDirection", e.target.value)}>
                    <option value="fixed">Fixed</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </td>
                <td><input type="number" min="0" max="1" value={piece.edgingTop} onChange={(e) => updatePiece(index, "edgingTop", e.target.value)} /></td>
                <td><input type="number" min="0" max="1" value={piece.edgingBottom} onChange={(e) => updatePiece(index, "edgingBottom", e.target.value)} /></td>
                <td><input type="number" min="0" max="1" value={piece.edgingLeft} onChange={(e) => updatePiece(index, "edgingLeft", e.target.value)} /></td>
                <td><input type="number" min="0" max="1" value={piece.edgingRight} onChange={(e) => updatePiece(index, "edgingRight", e.target.value)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PieceFormTable;
