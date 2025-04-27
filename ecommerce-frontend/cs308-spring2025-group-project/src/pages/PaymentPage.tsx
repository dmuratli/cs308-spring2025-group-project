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
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const handlePayment = async () => {
    if (!cardNumber || !expiry || !cvv) {
      setNotification({ open: true, message: "Please fill in all fields.", type: "error" });
      return;
    }

    const csrfToken = getCSRFToken();
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      setNotification({ open: true, message: "You must be logged in to pay.", type: "error" });
      return;
    }

    setLoading(true);
    try {
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
            expiry,
            cvv,
          }),
        }
      );
      const payData = await payRes.json();
      if (!payRes.ok) {
        throw new Error(payData.error || payData.message || "Payment failed.");
      }

      setServerMessage(payData.message);
      setNotification({ open: true, message: payData.message, type: "success" });

      const { invoice_html } = payData;

      // open it in a new tab
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(invoice_html);
        win.document.title = "Invoice";
        win.document.close();
      }

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
    <Container
      sx={{
        mt: 12,
        minHeight: "80vh",
        animation: "fadeIn 1s ease-in",
        "@keyframes fadeIn": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      }}
    >
      {serverMessage && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {serverMessage}
        </Alert>
      )}

      <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>
        Secure Payment
      </Typography>

      {cart && cart.items.length > 0 ? (
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={5}>
            <Card
              sx={{
                borderRadius: 4,
                boxShadow: 4,
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.02)" },
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Order Summary
                </Typography>
                {cart.items.map((item) => (
                  <Box key={item.id} display="flex" justifyContent="space-between" mb={1}>
                    <Typography>
                      {item.product_title} x{item.quantity}
                    </Typography>
                    <Typography>
                      ${(item.product_price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
                <Typography variant="h6" fontWeight="bold" mt={2} textAlign="right">
                  Total: ${total.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card
              sx={{
                borderRadius: 4,
                boxShadow: 4,
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.02)" },
              }}
            >
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

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Expiry Date (MM/YY)"
                      fullWidth
                      margin="normal"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="CVV"
                      fullWidth
                      margin="normal"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      inputProps={{ maxLength: 3 }}
                    />
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    mt: 3,
                    py: 1.8,
                    fontSize: "1rem",
                    fontWeight: "bold",
                    borderRadius: 3,
                    background: "linear-gradient(45deg, #f6ad55, #f97316)",
                    color: "#fff",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "linear-gradient(45deg, #f97316, #ea580c)",
                      transform: "scale(1.02)",
                    },
                    "&:active": {
                      transform: "scale(0.98)",
                    },
                  }}
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
