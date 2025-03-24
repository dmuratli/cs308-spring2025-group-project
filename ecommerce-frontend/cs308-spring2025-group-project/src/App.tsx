import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import React from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </>
  );
}

export default App;

/* ✅ Home Page Component */
function HomePage() {
  return (
    <Container
      maxWidth="md"
      sx={{
        textAlign: "center",
        mt: 8,
        p: 4,
        borderRadius: 2,
        bgcolor: "#f5f5f5",
        boxShadow: 3,
      }}
    >
      <Typography variant="h3" gutterBottom sx={{ fontWeight: "bold", color: "#333" }}>
        Welcome to Our Bookstore 📚
      </Typography>
      <Typography variant="h6" color="textSecondary" paragraph>
        Discover the best books and explore new worlds.
      </Typography>

      {/* Buttons */}
      <Box mt={4}>
        <Button variant="contained" color="primary" sx={{ mx: 1 }}>
          Browse Books
        </Button>
        <Button variant="outlined" color="secondary" sx={{ mx: 1 }}>
          Contact Us
        </Button>
      </Box>
    </Container>
  );
}
