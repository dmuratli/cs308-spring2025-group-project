import { Button, Container, TextField, Typography, Box, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import React from "react";

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:8000/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: name,  // Make sure backend expects `username` not `name`
          email,
          password,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error("Backend Error:", data);
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Something went wrong.", error);
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
        <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" color="#EF977F" gutterBottom>
            Register
          </Typography>

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
              sx={{
                mt: 2,
                backgroundColor: "#EF977F",
                "&:hover": { backgroundColor: "#d46c4e" },
              }}
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
