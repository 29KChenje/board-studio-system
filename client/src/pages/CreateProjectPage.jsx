import { useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../api/http";
import PieceFormTable from "../components/PieceFormTable";
import { persistProjectId } from "../utils/projectSelection";

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const [project, setProject] = useState({
    name: "",
    width: 900,
    height: 720,
    depth: 560,
    boardWidth: 2750,
    boardHeight: 1830,
    material: "Melamine White",
    autoGeneratePieces: true
  });
  const [pieces, setPieces] = useState([]);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!project.autoGeneratePieces) {
      if (!pieces.length) {
        setError("Add at least one piece or switch on auto-generation.");
        return;
      }

      const hasInvalidPiece = pieces.some(
        (piece) => !piece.name || Number(piece.width) <= 0 || Number(piece.height) <= 0 || Number(piece.quantity) <= 0
      );

      if (hasInvalidPiece) {
        setError("Each manual piece needs a name, width, height, and quantity.");
        return;
      }
    }

    setError("");

    try {
      const { data: createdProject } = await http.post("/projects", project);
      if (!project.autoGeneratePieces && pieces.length) {
        await http.post("/pieces", {
          projectId: createdProject.id,
          pieces: pieces.map((piece) => ({
            ...piece,
            width: Number(piece.width),
            height: Number(piece.height),
            quantity: Number(piece.quantity),
            edgingTop: Number(piece.edgingTop),
            edgingBottom: Number(piece.edgingBottom),
            edgingLeft: Number(piece.edgingLeft),
            edgingRight: Number(piece.edgingRight)
          }))
        });
      }
      persistProjectId(createdProject.id);
      navigate(`/cutting-list?projectId=${createdProject.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create project");
    }
  };

  return (
    <div className="page-grid">
      <form className="panel form-grid" onSubmit={handleSubmit}>
        <div className="section-header">
          <div>
            <p className="eyebrow">New Project</p>
            <h2>Cabinet setup</h2>
          </div>
        </div>

        <input placeholder="Project name" value={project.name} onChange={(e) => setProject((current) => ({ ...current, name: e.target.value }))} />
        <div className="inline-grid">
          <input type="number" placeholder="Width" value={project.width} onChange={(e) => setProject((current) => ({ ...current, width: Number(e.target.value) }))} />
          <input type="number" placeholder="Height" value={project.height} onChange={(e) => setProject((current) => ({ ...current, height: Number(e.target.value) }))} />
          <input type="number" placeholder="Depth" value={project.depth} onChange={(e) => setProject((current) => ({ ...current, depth: Number(e.target.value) }))} />
        </div>
        <div className="inline-grid">
          <input type="number" placeholder="Board width" value={project.boardWidth} onChange={(e) => setProject((current) => ({ ...current, boardWidth: Number(e.target.value) }))} />
          <input type="number" placeholder="Board height" value={project.boardHeight} onChange={(e) => setProject((current) => ({ ...current, boardHeight: Number(e.target.value) }))} />
          <input placeholder="Material" value={project.material} onChange={(e) => setProject((current) => ({ ...current, material: e.target.value }))} />
        </div>

        <label className="checkbox-row">
          <input type="checkbox" checked={project.autoGeneratePieces} onChange={(e) => setProject((current) => ({ ...current, autoGeneratePieces: e.target.checked }))} />
          Auto-generate cabinet pieces
        </label>

        {error ? <p className="error-text">{error}</p> : null}
        <button type="submit">Create project</button>
      </form>

      {!project.autoGeneratePieces ? <PieceFormTable pieces={pieces} setPieces={setPieces} /> : null}
    </div>
  );
};

export default CreateProjectPage;
