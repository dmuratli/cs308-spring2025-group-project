import { Button, Container, TextField, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import React from "react";

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registering with:", { name, email, password });
    navigate("/login"); // Redirect to Login after registration
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

        <form onSubmit={handleRegister} style={{ width: "100%" }}>
          <TextField
            label="Full Name"
            type="text"
            fullWidth
            margin="normal"
            required
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2 }}>
            Register
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
