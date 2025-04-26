import React, { useEffect } from "react";
import { Routes, Route }   from "react-router-dom";
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
import SalesManagerDashboard     from "./pages/admin/SalesManagerDashboard";
import ProfilePage from "./pages/ProfilePage";
import BookDetailsPage from "./pages/BookDetailPage";
import CommentsPage from "./pages/admin/CommentsPage";
import InvoicesPage from "./pages/admin/InvoicesPage";
import CartPage            from "./pages/CartPage";
import PaymentPage         from "./pages/PaymentPage";
import TransactionHistoryPage from "./pages/TransactionHistoryPage";
import RateReviewPage      from "./pages/RateReviewPage";
import { CartProvider } from "./context/CartContext";
import { Typography, Container } from "@mui/material";

function App() {
  useEffect(() => {
    axios.get("http://localhost:8000/api/csrf/", { withCredentials: true });

    fetch("http://localhost:8000/api/csrf/", { credentials: "include" }).catch(
      (err) => console.error("Failed to fetch CSRF token:", err)
    );
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
        <Route
          path="*"
          element={
            <Container sx={{ mt: 12, textAlign: "center", py: 4 }}>
              <Typography variant="h4">404 – Page not found</Typography>
              <Typography variant="body1" color="text.secondary">
                Oops! We can’t find that page.
              </Typography>
            </Container>
          }
        />
      </Routes>
    </CartProvider>
  );
}

export default App;
