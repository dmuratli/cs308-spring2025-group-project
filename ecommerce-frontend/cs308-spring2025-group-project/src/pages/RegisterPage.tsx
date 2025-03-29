import { Button, Container, TextField, Typography, Box, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import React from "react";
import { Email } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext"; // Import your auth context

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Use the existing login() method from context
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, password, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Registration failed");
      } else {
        // Save tokens in localStorage
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("isAuthenticated", "true");
        // Call the login method from AuthContext to update the auth state
        login();
        // Redirect to home page after logging in
        navigate("/");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
        <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" color="#EF977F" gutterBottom>
            Register
          </Typography>

          {error && <Typography color="error">{error}</Typography>}

          <form onSubmit={handleRegister} style={{ width: "100%" }}>
            <TextField
              label="Username"
              type="text"
              fullWidth
              margin="normal"
              required
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              required
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, backgroundColor: "#EF977F", "&:hover": { backgroundColor: "#d46c4e" } }}
            >
              Register
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 2 }}>
            Already have an account?{" "}
            <Button color="secondary" onClick={() => navigate("/login")}>
              Login
            </Button>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default RegisterPage;