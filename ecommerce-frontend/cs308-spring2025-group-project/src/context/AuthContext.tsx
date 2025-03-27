import React, { createContext, useContext, useState, useEffect } from "react";

// Define types
interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// CSRF token helper function
export function getCSRFToken(): string {
  const match = document.cookie.match(
    new RegExp("(^| )" + "csrftoken" + "=([^;]+)")
  );
  return match ? match[2] : "";
}

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem("isAuthenticated") === "true"
  );

  useEffect(() => {
    // Sync with localStorage in case it changes elsewhere
    const handleStorageChange = () => {
      setIsAuthenticated(localStorage.getItem("isAuthenticated") === "true");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = () => {
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      const accessToken = localStorage.getItem("access_token");
  
      if (refreshToken && accessToken) {
        const response = await fetch("http://localhost:8000/api/logout/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
  
        if (!response.ok) {
          console.error("Backend logout failed:", await response.text());
        }
      }
  
      // Clean up regardless of backend response
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("isAuthenticated");
      setIsAuthenticated(false);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
