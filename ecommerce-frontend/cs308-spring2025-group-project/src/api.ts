// src/api.ts
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/auth/";

export interface AuthResponse {
  access: string;
  refresh: string;
  username: string;
  email: string;
}

export const login = async (username: string, password: string): Promise<AuthResponse | null> => {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}login/`, {
      username,
      password,
    });
    
    // Store tokens in localStorage
    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);
    localStorage.setItem("access_token",  response.data.access);
    localStorage.setItem("refresh_token", response.data.refresh);
    localStorage.setItem("username", response.data.username);
    
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    return null;
  }
};

export const register = async (username: string, email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}register/`, {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const refresh = localStorage.getItem("refresh");
    await axios.post(`${API_URL}logout/`, { refresh });
    
    // Clear stored tokens
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

export const getAuthHeaders = (): { Authorization?: string } => {
  const token = localStorage.getItem("access") || localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("access");
};