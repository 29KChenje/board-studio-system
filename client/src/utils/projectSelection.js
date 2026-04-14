const STORAGE_KEY = "board_studio_selected_project_id";

export const getStoredProjectId = () => localStorage.getItem(STORAGE_KEY) || "";

export const persistProjectId = (projectId) => {
  if (projectId) {
    localStorage.setItem(STORAGE_KEY, String(projectId));
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
};

export const resolveProjectId = (projects, preferredProjectId) => {
  if (!projects.length) {
    return "";
  }

  const preferredId = preferredProjectId ? String(preferredProjectId) : "";
  if (preferredId && projects.some((project) => String(project.id) === preferredId)) {
    return preferredId;
  }

  return String(projects[0].id);
};
