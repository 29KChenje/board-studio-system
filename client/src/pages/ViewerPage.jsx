import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import http from "../api/http";
import CabinetViewer from "../components/CabinetViewer";
import { getStoredProjectId, persistProjectId, resolveProjectId } from "../utils/projectSelection";

const ViewerPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryProjectId = searchParams.get("projectId") || "";
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [model, setModel] = useState(null);
  const [error, setError] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingModel, setIsLoadingModel] = useState(false);

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
      setModel(null);
      return;
    }

    persistProjectId(selectedProjectId);
    if (selectedProjectId !== queryProjectId) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("projectId", selectedProjectId);
      setSearchParams(nextParams, { replace: true });
    }
    setIsLoadingModel(true);
    setError("");

    const loadModel = async () => {
      try {
        const { data } = await http.get(`/3d-model/${selectedProjectId}`);
        setModel(data);
      } catch (requestError) {
        setModel(null);
        setError(requestError.response?.data?.message || "Unable to load 3D model.");
      } finally {
        setIsLoadingModel(false);
      }
    };
    loadModel();
  }, [queryProjectId, searchParams, selectedProjectId, setSearchParams]);

  return (
    <div className="page-grid">
      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">3D Viewer</p>
            <h2>Cabinet preview</h2>
          </div>
          <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        {isLoadingProjects || isLoadingModel ? <p className="muted">Loading 3D preview...</p> : null}
        <CabinetViewer model={model} />
        {model ? (
          <div className="action-row">
            <Link to={`/cutting-list?projectId=${selectedProjectId}`}>
              <button type="button" className="secondary-button dark-button">Open cutting list</button>
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default ViewerPage;
