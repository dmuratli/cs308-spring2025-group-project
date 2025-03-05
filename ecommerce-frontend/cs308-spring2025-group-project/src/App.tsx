import { Routes, Route } from "react-router-dom";
import React from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage"; // Import the HomePage component
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Add the HomePage Route */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </>
  );
}

export default App;
