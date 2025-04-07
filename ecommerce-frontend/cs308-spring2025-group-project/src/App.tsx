import { Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageUsers from "./pages/admin/ManageUsers";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import ProductPage from "./pages/ProductPage";

import ProfilePage from "./pages/ProfilePage";
import BookDetailsPage from "./pages/BookDetailPage";

function App() {
  useEffect(() => {
    axios.get("http://localhost:8000/api/csrf/", {
      withCredentials: true,
    });
  }, []);
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Adding the HomePage Route */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<div>404 Not Found</div>} />
        <Route path="/profile" element={<ProfilePage/>} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<ManageProducts />} />
        <Route path="/admin/orders" element={<ManageOrders />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
        <Route path="/admin/edit-product/:slug" element={<EditProduct />} />

        <Route path="/products" element={<ProductPage/>} />
        <Route path="/products/:slug" element={<BookDetailsPage />} />


        
      </Routes>
    </>
  );
}

export default App;
