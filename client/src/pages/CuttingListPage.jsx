import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import http from "../api/http";
import { getStoredProjectId, persistProjectId, resolveProjectId } from "../utils/projectSelection";

const CuttingListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryProjectId = searchParams.get("projectId") || "";
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [detail, setDetail] = useState(null);
  const [orderMessage, setOrderMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { data } = await http.get("/projects");
        setProjects(data);
        const nextProjectId = resolveProjectId(data, queryProjectId || getStoredProjectId());
        setSelectedProjectId(nextProjectId);
      } catch (error) {
        setProjects([]);
        setError("Unable to load your projects right now.");
      } finally {
        setIsLoadingProjects(false);
      }
    };
    loadProjects();
  }, [queryProjectId]);

  useEffect(() => {
    if (!selectedProjectId) {
      setDetail(null);
      return;
    }

    persistProjectId(selectedProjectId);
    if (selectedProjectId !== queryProjectId) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("projectId", selectedProjectId);
      setSearchParams(nextParams, { replace: true });
    }
    setIsLoadingDetail(true);
    setError("");

    const loadProjectDetail = async () => {
      try {
        const { data } = await http.get(`/projects/${selectedProjectId}`);
        setDetail(data);
      } catch (requestError) {
        setDetail(null);
        setError(requestError.response?.data?.message || "Unable to load this project.");
      } finally {
        setIsLoadingDetail(false);
      }
    };
    loadProjectDetail();
  }, [queryProjectId, searchParams, selectedProjectId, setSearchParams]);

  const requestCutting = async () => {
    try {
      const { data } = await http.post("/orders/workshop", { projectId: Number(selectedProjectId) });
      setOrderMessage(`Cutting request submitted. Order #${data.id} is now ${data.status}.`);
    } catch (error) {
      setOrderMessage(error.response?.data?.message || "Unable to create cutting order.");
    }
  };

  const downloadPdf = async (type) => {
    const response = await http.get(`/exports/projects/${selectedProjectId}/${type}.pdf`, {
      responseType: "blob"
    });
    const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${type}-${selectedProjectId}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-grid">
      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Cutting List</p>
            <h2>Optimized board schedule</h2>
          </div>
          <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>

        {error ? <p className="error-text">{error}</p> : null}
        {isLoadingProjects || isLoadingDetail ? <p className="muted">Loading project details...</p> : null}
        {detail?.pieces?.length ? (
          <div className="list-stack">
            {detail.pieces.map((piece) => (
              <article className="list-item" key={piece.id}>
                <strong>{piece.name}</strong>
                <span>{piece.width} x {piece.height} ({piece.quantity} pieces)</span>
              </article>
            ))}
          </div>
        ) : detail && !detail.pieces?.length ? (
          <div className="empty-state">
            <p className="muted">This project has no pieces yet, so there is nothing to optimize.</p>
            <Link to="/projects/new">
              <button type="button">Create another project</button>
            </Link>
          </div>
        ) : (
          <p className="muted">Select a project to inspect its cutting list.</p>
        )}
      </section>

      <section className="panel">
        <p className="eyebrow">Optimization Result</p>
        <h2>Board usage</h2>
        {detail?.optimization ? (
          <>
            <div className="stats-grid compact">
              <div className="stat-card"><span className="muted">Boards used</span><strong>{detail.optimization.boardCount}</strong></div>
              <div className="stat-card"><span className="muted">Waste</span><strong>{detail.optimization.totalWastePercentage}%</strong></div>
              <div className="stat-card"><span className="muted">Quote</span><strong>R {detail.quote?.totalCost}</strong></div>
            </div>
            <div className="action-row">
              <button type="button" onClick={requestCutting}>Request cutting service</button>
              <Link to={`/viewer?projectId=${selectedProjectId}`}>
                <button type="button" className="secondary-button dark-button">Open 3D viewer</button>
              </Link>
              <button type="button" className="secondary-button dark-button" onClick={() => downloadPdf("cutting-list")}>
                Export cutting list PDF
              </button>
              <button type="button" className="secondary-button dark-button" onClick={() => downloadPdf("cutting-layout")}>
                Export layout PDF
              </button>
            </div>
            {orderMessage ? <p className="muted">{orderMessage}</p> : null}
            <div className="list-stack">
              {detail.optimization.boards.map((board) => (
                <article key={board.board} className="list-item">
                  <strong>{board.board}</strong>
                  <span>{board.utilizationRate}% utilization, {board.placements.length} placements</span>
                </article>
              ))}
            </div>
          </>
        ) : (
          <p className="muted">Optimization will appear when pieces have been added.</p>
        )}
      </section>
    </div>
  );
};

export default CuttingListPage;
