// src/axios.ts
import axios from "axios";
import { getCookie } from "./utils/cookies";  // path to your cookie reader

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  withCredentials: true,  // send sessionid + csrftoken cookies
});

api.interceptors.request.use((config) => {
  const jwt = localStorage.getItem("access_token") || localStorage.getItem("access");
  if (jwt) config.headers["Authorization"] = `Bearer ${jwt}`;
  const csrf = getCookie("csrftoken");
  if (csrf && /^(post|put|patch|delete)$/i.test(config.method || "")) {
    config.headers["X-CSRFToken"] = csrf;
  }
  return config;
});

export default api;
