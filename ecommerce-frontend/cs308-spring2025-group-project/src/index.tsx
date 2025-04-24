import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";

// 1) Point at backend
axios.defaults.baseURL = "http://127.0.0.1:8000";
// 2) Send cookies on every request
axios.defaults.withCredentials = true;
// 3) Use Django’s CSRF cookie/header names
axios.defaults.xsrfCookieName  = "csrftoken";
axios.defaults.xsrfHeaderName  = "X-CSRFToken";
// 4) Attach JWT if present
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);