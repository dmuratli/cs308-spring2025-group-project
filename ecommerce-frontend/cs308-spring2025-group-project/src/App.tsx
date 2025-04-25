// src/App.tsx
import React, { useEffect } from "react";
import { Routes, Route }   from "react-router-dom";
import axios               from "axios";

// ortak bileşenler
import Navbar       from "./components/Navbar";
import { CartProvider } from "./context/CartContext";

// genel sayfalar
import HomePage            from "./pages/HomePage";
import LoginPage           from "./pages/LoginPage";
import RegisterPage        from "./pages/RegisterPage";
import ProfilePage         from "./pages/ProfilePage";
import CartPage            from "./pages/CartPage";
import PaymentPage         from "./pages/PaymentPage";
import ProductPage         from "./pages/ProductPage";
import BookDetailsPage     from "./pages/BookDetailPage";
import TransactionHistoryPage from "./pages/TransactionHistoryPage";
import RateReviewPage      from "./pages/RateReviewPage";

// yönetim panelleri
import AdminDashboard            from "./pages/admin/AdminDashboard";
import ManageProducts            from "./pages/admin/ManageProducts";
import ManageOrders              from "./pages/admin/ManageOrders";
import ManageUsers               from "./pages/admin/ManageUsers";
import AddProduct                from "./pages/admin/AddProduct";
import EditProduct               from "./pages/admin/EditProduct";
import CommentsPage              from "./pages/admin/CommentsPage";
import InvoicesPage              from "./pages/admin/InvoicesPage";
import ProductManagerDashboard   from "./pages/admin/ProductManagerDashboard";
import SalesManagerDashboard     from "./pages/admin/SalesManagerDashboard";

function App() {
  /* CSRF çerezi */
  useEffect(() => {
    axios.get("http://localhost:8000/api/csrf/", { withCredentials: true });
    fetch("http://localhost:8000/csrf/", { credentials: "include" }).catch(
      (err) => console.error("Failed to fetch CSRF token:", err)
    );
  }, []);

  return (
    <CartProvider>
      <Navbar />

      <Routes>
        {/* — KULLANICI/RAPOR BÖLÜMÜ — */}
        <Route path="/"                        element={<HomePage />} />
        <Route path="/login"                   element={<LoginPage />} />
        <Route path="/register"                element={<RegisterPage />} />
        <Route path="/profile"                 element={<ProfilePage />} />
        <Route path="/profile/transactions"    element={<TransactionHistoryPage />} />

        {/* — ÜRÜNLER — */}
        <Route path="/products"                element={<ProductPage />} />
        <Route path="/products/:slug"          element={<BookDetailsPage />} />

        {/* — ALIŞVERİŞ — */}
        <Route path="/cart"                    element={<CartPage />} />
        <Route path="/payment"                 element={<PaymentPage />} />

        {/* — YORUM SAYFASI (transaksiyon sonrası) — */}
        <Route path="/review/:orderId"         element={<RateReviewPage />} />

        {/* — ADMİN — */}
        <Route path="/admin"                   element={<AdminDashboard />} />
        <Route path="/admin/products"          element={<ManageProducts panel="admin" />} />
        <Route path="/admin/orders"            element={<ManageOrders />} />
        <Route path="/admin/users"             element={<ManageUsers />} />
        <Route path="/admin/add-product"       element={<AddProduct />} />
        <Route path="/admin/edit-product/:slug"element={<EditProduct />} />

        {/* — PRODUCT MANAGER — */}
        <Route path="/product-manager"                         element={<ProductManagerDashboard />} />
        <Route path="/product-manager/manage-products"         element={<ManageProducts panel="manager" />} />
        <Route path="/product-manager/add-product"             element={<AddProduct />} />
        <Route path="/product-manager/edit-product/:slug"      element={<EditProduct />} />
        <Route path="/product-manager/comments"                element={<CommentsPage />} />
        <Route path="/product-manager/orders"                  element={<ManageOrders />} />
        <Route path="/product-manager/invoices"                element={<InvoicesPage />} />

        {/* — SALES MANAGER — */}
        <Route path="/sales-manager"            element={<SalesManagerDashboard />} />
        <Route path="/sales-manager/invoices"   element={<InvoicesPage />} />

        {/* — 404 (daima en son) — */}
        <Route path="*" element={<div style={{padding:40}}>404 – Sayfa bulunamadı</div>} />
      </Routes>
    </CartProvider>
  );
}

export default App;
