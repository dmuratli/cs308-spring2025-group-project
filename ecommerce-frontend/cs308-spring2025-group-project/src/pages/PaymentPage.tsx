// src/ecommerce-frontend/src/pages/PaymentPage.tsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getCSRFToken } from "../context/AuthContext";

const PaymentPage: React.FC = () => {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry]       = useState("");
  const [cvv, setCvv]             = useState("");
  const [loading, setLoading]     = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error";
  }>({ open: false, message: "", type: "success" });

  // Show the real server message above the form, if any
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  // Fetch the cart once on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const handlePayment = async () => {
    // 1) Front-end field check
    if (!cardNumber || !expiry || !cvv) {
      setNotification({ open: true, message: "Please fill in all fields.", type: "error" });
      return;
    }

    const csrfToken    = getCSRFToken();
    const accessToken  = localStorage.getItem("access_token");
    if (!accessToken) {
      setNotification({ open: true, message: "You must be logged in to pay.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      // 2) Place the order
      const orderRes = await fetch("http://localhost:8000/api/orders/place/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to place order.");
      }
      const { order_id } = orderData;

      // 3) Process payment
      const payRes = await fetch(
        `http://localhost:8000/api/payment/process/${order_id}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            card_number: cardNumber,
            expiry,    // MM/YY
            cvv,
          }),
        }
      );
      const payData = await payRes.json();
      if (!payRes.ok) {
        throw new Error(payData.error || payData.message || "Payment failed.");
      }

      // 4) Success — surface the server's exact message
      setServerMessage(payData.message);
      setNotification({
        open: true,
        message: payData.message,
        type: "success",
      });

      // 5) Refresh cart & redirect
      await fetchCart();
      setTimeout(() => navigate("/profile/transactions"), 1500);

    } catch (err: any) {
      setNotification({
        open: true,
        message: err.message || "An error occurred.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const total = cart
    ? cart.items.reduce((sum, item) => sum + item.product_price * item.quantity, 0)
    : 0;

  return (
    <Container sx={{ mt: 12, minHeight: "80vh" }}>
      {serverMessage && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {serverMessage}
        </Alert>
      )}

      <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>
        Payment
      </Typography>

      {cart && cart.items.length > 0 ? (
        <Grid container spacing={4}>
          {/* Order summary */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Order Summary
                </Typography>
                {cart.items.map((item) => (
                  <Box key={item.id} display="flex" justifyContent="space-between" mb={2}>
                    <Typography>
                      {item.product_title} x{item.quantity}
                    </Typography>
                    <Typography>
                      ${(item.product_price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
                <Typography variant="h6" fontWeight="bold" mt={2}>
                  Total: ${total.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Payment form */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Payment Details
                </Typography>

                <TextField
                  label="Card Number"
                  fullWidth
                  margin="normal"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  inputProps={{ maxLength: 19 }}
                />

                <TextField
                  label="Expiry Date (MM/YY)"
                  fullWidth
                  margin="normal"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                />

                <TextField
                  label="CVV"
                  fullWidth
                  margin="normal"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  inputProps={{ maxLength: 3 }}
                />

                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? "Processing…" : "Pay Now"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Alert severity="info">Your cart is empty. Please add items to proceed.</Alert>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification((n) => ({ ...n, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={notification.type}>{notification.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default PaymentPage;
