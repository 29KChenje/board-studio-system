import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://80.65.211.200:5000/api",
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("board_studio_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;