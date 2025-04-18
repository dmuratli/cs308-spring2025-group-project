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
import ProductManagerDashboard from './pages/admin/ProductManagerDashboard';
import ProfilePage from "./pages/ProfilePage";
import BookDetailsPage from "./pages/BookDetailPage";
import StockPage from "./pages/admin/StockPage";
import CommentsPage from "./pages/admin/CommentsPage";
import DeliveryPage from "./pages/admin/DeliveryPage";
import InvoicesPage from "./pages/admin/InvoicesPage";
import { CartProvider } from "./context/CartContext";
import CartPage from "./pages/CartPage";


function App() {
  useEffect(() => {
    axios.get("http://localhost:8000/api/csrf/", {
      withCredentials: true,
    });
  }, []);
  
  return (
    <CartProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<div>404 Not Found</div>} />
        <Route path="/profile" element={<ProfilePage/>} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<ManageProducts panel="admin" />} />
        <Route path="/admin/orders" element={<ManageOrders  />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
        <Route path="/admin/edit-product/:slug" element={<EditProduct />} />
        <Route path="/product-manager" element={<ProductManagerDashboard />} />
        <Route path="/products" element={<ProductPage/>} />
        <Route path="/products/:slug" element={<BookDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/product-manager/manage-products" element={<ManageProducts panel="manager" />} />
        <Route path="/product-manager/add-product" element={<AddProduct />} />
        <Route path="/product-manager/edit-product/:slug" element={<EditProduct />} />
        <Route path="/product-manager/stocks" element={<StockPage />} />
        <Route path="/product-manager/comments" element={<CommentsPage />} />
        <Route path="/product-manager/deliveries" element={<DeliveryPage />} />

     
        <Route path="/product-manager/orders" element={<ManageOrders />} />
        <Route path="/product-manager/invoices" element={<InvoicesPage />} />

      </Routes>
    </CartProvider>
  );
}

export default App;