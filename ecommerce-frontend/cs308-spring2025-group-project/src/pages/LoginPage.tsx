import { Button, Container, TextField, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import React from "react";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in with:", { email, password });
    navigate("/"); // Redirect to Home after login
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

        <form onSubmit={handleLogin} style={{ width: "100%" }}>
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

          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2 }}>
            Login
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
