import { Button, Container, TextField, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import React, { FormEvent } from "react";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Login error:", data);
        setError(data.detail || "Login failed");
        return;
      }

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      navigate("/"); // Redirect to home page
    } catch (error) {
      console.error("Network error:", error);
      setError("Network error. Please try again.");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
        <Typography variant="h4" gutterBottom>Login</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <form onSubmit={handleLogin} style={{ width: "100%" }}>
          <TextField label="Email" type="email" fullWidth margin="normal" required variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Password" type="password" fullWidth margin="normal" required variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2 }}>Login</Button>
        </form>
      </Box>
    </Container>
  );
}

export default LoginPage;
