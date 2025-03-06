// src/pages/LoginPage.tsx
import { Button, Container, TextField, Typography, Box, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import React from "react";
import { login } from "../api";

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await login(username, password);
      if (response) {
        // Login successful
        console.log("Login successful:", response);
        navigate("/"); // Redirect to home page
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("An error occurred during login.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        
        {error && <Alert severity="error" sx={{ width: "100%", mb: 2 }}>{error}</Alert>}

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
            color="primary" 
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Don't have an account?{" "}
          <Button color="secondary" onClick={() => navigate("/register")}>
            Register
          </Button>
        </Typography>
      </Box>
    </Container>
  );
}

export default LoginPage;