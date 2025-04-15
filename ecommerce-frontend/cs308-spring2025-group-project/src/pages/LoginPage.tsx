import React, { useState } from "react";
import {
  Button,
  Container,
  TextField,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Use AuthContext
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Extract the "next" parameter from query string, default to "/"
  const params = new URLSearchParams(location.search);
  const nextUrl = params.get("next") || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Login failed");
      } else {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        login();
        // Redirect to nextUrl instead of the homepage
        navigate(nextUrl);
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <Paper
          elevation={3}
          sx={{ p: 4, width: "100%", maxWidth: 400, textAlign: "center" }}
        >
          <Typography variant="h4" fontWeight="bold" color="#EF977F" gutterBottom>
            Login
          </Typography>

          {error && <Typography color="error">{error}</Typography>}

          <form onSubmit={handleLogin} style={{ width: "100%" }}>
            <TextField
              label="Username"
              type="text"
              fullWidth
              margin="normal"
              required
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              required
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                backgroundColor: "#EF977F",
                "&:hover": { backgroundColor: "#d46c4e" },
              }}
            >
              Login
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 2 }}>
            Don't have an account?{" "}
            <Button color="secondary" onClick={() => navigate("/register")}>
              Register
            </Button>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default LoginPage;