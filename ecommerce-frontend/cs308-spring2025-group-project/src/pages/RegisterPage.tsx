// src/pages/RegisterPage.tsx
import { Button, Container, TextField, Typography, Box, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import React from "react";
import axios from "axios";

function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/auth/register/", {
        username,
        email,
        password
      });
      
      console.log("Registration successful:", response.data);
      navigate("/login"); // Redirect to login page after registration
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || "Registration failed");
      } else {
        setError("An error occurred during registration");
      }
      console.error("Registration error:", err);
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
          Register
        </Typography>
        
        {error && <Alert severity="error" sx={{ width: "100%", mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleRegister} style={{ width: "100%" }}>
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
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            required
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account?{" "}
          <Button color="secondary" onClick={() => navigate("/login")}>
            Login
          </Button>
        </Typography>
      </Box>
    </Container>
  );
}

export default RegisterPage;