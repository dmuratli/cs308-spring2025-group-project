// src/App.tsx
import React, { useEffect } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import axios from "axios";
import Navbar from "./components/Navbar";
import HomePage                from "./pages/HomePage";
import LoginPage               from "./pages/LoginPage";
import RegisterPage            from "./pages/RegisterPage";
import ProfilePage             from "./pages/ProfilePage";
import TransactionHistoryPage  from "./pages/TransactionHistoryPage";
import ProductPage             from "./pages/ProductPage";
import BookDetailsPage         from "./pages/BookDetailPage";
import CartPage                from "./pages/CartPage";
import PaymentPage             from "./pages/PaymentPage";
import RateReviewPage          from "./pages/RateReviewPage";
import RefundDetailsPage       from "./pages/RefundDetailsPage";

import RequireRole             from "./components/RequireRole";

// product-manager screens
import ProductManagerDashboard from "./pages/admin/ProductManagerDashboard";
import ManageProducts          from "./pages/admin/ManageProducts";
import AddProduct              from "./pages/admin/AddProduct";
import EditProduct             from "./pages/admin/EditProduct";
import ManageOrders            from "./pages/admin/ManageOrders";
import CommentsPage            from "./pages/admin/CommentsPage";
import InvoicesPage            from "./pages/admin/InvoicesPage";
import ManageGenres            from "./pages/admin/ManageGenres";

// sales-manager screens
import SalesManagerDashboard   from "./pages/admin/SalesManagerDashboard";

function App() {
  // fetch CSRF on mount…
  useEffect(() => {
    axios.get("http://localhost:8000/api/csrf/", { withCredentials: true }).catch(console.error);
  }, []);

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"     element={<HomePage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Profile (customers only) */}
        <Route
          path="/profile/*"
          element={
            <RequireRole role="customer">
              <Outlet/>
            </RequireRole>
          }
        >
          <Route index             element={<ProfilePage />} />
          <Route path="transactions" element={<TransactionHistoryPage />} />
          <Route path="refunds"      element={<RefundDetailsPage />} />
        </Route>

        {/* Products */}
        <Route path="/products"      element={<ProductPage />} />
        <Route path="/products/:slug" element={<BookDetailsPage />} />

        {/* Cart & Checkout */}
        <Route path="/cart"    element={<CartPage />} />
        <Route path="/payment" element={<PaymentPage />} />

        {/* Post-purchase review */}
        <Route path="/review/:orderId" element={<RateReviewPage />} />

        {/* Product-Manager area */}
        <Route
          path="/product-manager/*"
          element={
            <RequireRole role="product manager">
              <Outlet/>
            </RequireRole>
          }
        >
          <Route index                          element={<ProductManagerDashboard />} />
          <Route path="manage-products"         element={<ManageProducts panel="manager" />} />
          <Route path="genres"          element={<ManageGenres />} />
          <Route path="add-product"             element={<AddProduct />} />
          <Route path="edit-product/:slug"      element={<EditProduct />} />
          <Route path="orders"                  element={<ManageOrders />} />
          <Route path="comments"                element={<CommentsPage />} />
          <Route path="invoices"                element={<InvoicesPage />} />
        </Route>

        {/* Sales-Manager area */}
        <Route
          path="/sales-manager/*"
          element={
            <RequireRole role="sales manager">
              <Outlet/>
            </RequireRole>
          }
        >
          <Route index                element={<SalesManagerDashboard />} />
          <Route path="invoices"      element={<InvoicesPage />} />
        </Route>

        {/* 404 catch-all */}
        <Route path="*" element={
          <div style={{ padding: 40, textAlign: "center" }}>
            <h1>404 – Page not found</h1>
            <p>Sorry, we couldn’t find that page.</p>
          </div>
        }/>
      </Routes>
    </>
  );
}

export default App;