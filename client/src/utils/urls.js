export const API_BASE = "http://localhost:5000";

export const getServerBaseUrl = () => API_BASE;

export const getImageUrl = (path) => {
  if (!path) return "";
  return `${API_BASE}/${path}`;
};