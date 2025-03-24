import { Routes, Route } from "react-router-dom";
import React from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage"; // Import the HomePage component
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageUsers from "./pages/admin/ManageUsers";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct"; // ✅ Import
import ProductPage from "./pages/ProductPage"; // ✅ Import




import ProfilePage from "./pages/ProfilePage";
import BookDetailsPage from "./pages/BookDetailPage";

function App() {
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
        <Route path="/admin/edit-product/:id" element={<EditProduct />} />
        <Route path="/products" element={<ProductPage/>} />
        <Route path="/products/:title-:author" element={<BookDetailsPage />} />

        
      </Routes>
    </>
  );
}

export default App;
