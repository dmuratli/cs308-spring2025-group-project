import { Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageOrders from "./pages/admin/ManageOrders";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import ProductPage from "./pages/ProductPage";
import ProductManagerDashboard from './pages/admin/ProductManagerDashboard';
import ProfilePage from "./pages/ProfilePage";
import BookDetailsPage from "./pages/BookDetailPage";
import CommentsPage from "./pages/admin/CommentsPage";
import InvoicesPage from "./pages/admin/InvoicesPage";
import { CartProvider } from "./context/CartContext";
import CartPage from "./pages/CartPage";
import SalesManagerDashboard from "./pages/admin/SalesManagerDashboard";
import PaymentPage from "./pages/PaymentPage";
import TransactionHistoryPage from "./pages/TransactionHistoryPage";

function App() {
  useEffect(() => {
    axios.get("http://localhost:8000/api/csrf/", {
      withCredentials: true,
    });
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/api/csrf/", {
      credentials: "include", // Include cookies in the request
    }).catch((error) => console.error("Failed to fetch CSRF token:", error));
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
        <Route path="/product-manager" element={<ProductManagerDashboard />} />
        <Route path="/products" element={<ProductPage/>} />
        <Route path="/products/:slug" element={<BookDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/product-manager/manage-products" element={<ManageProducts panel="manager" />} />
        <Route path="/product-manager/add-product" element={<AddProduct />} />
        <Route path="/product-manager/edit-product/:slug" element={<EditProduct />} />
        <Route path="/product-manager/comments" element={<CommentsPage />} />
        <Route path="/product-manager/orders" element={<ManageOrders />} />
        <Route path="/product-manager/invoices" element={<InvoicesPage />} />
        <Route path="/sales-manager" element={<SalesManagerDashboard />} />
        <Route path="/sales-manager/invoices" element={<InvoicesPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/profile/transactions" element={<TransactionHistoryPage />} />


      </Routes>
    </CartProvider>
  );
}

export default App;