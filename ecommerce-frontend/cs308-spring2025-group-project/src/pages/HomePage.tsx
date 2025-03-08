import React, { useEffect, useState } from "react";

const HomePage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsAuthenticated(false);
  };

  return (
    <div style={styles.homepage}>
      <div style={styles.navbar}>
        <h1 style={styles.logo}>Book Store</h1>
        <div style={styles.buttonGroup}>
          {isAuthenticated ? (
            <button style={styles.button} onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <button style={styles.button} onClick={() => window.location.href = "/register"}>Sign Up</button>
              <button style={styles.button} onClick={() => window.location.href = "/login"}>Login</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  homepage: {
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 50px",
    backgroundColor: "#fff",
    boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
    position: "fixed",
    width: "100%",
    top: 0,
    zIndex: 101,
  },
  logo: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
  },
  button: {
    backgroundColor: "#EF977F",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginLeft: "10px",
  },
};

export default HomePage;
