import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  Button,
  Grid,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import axios, { AxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const formatPrice = (price: any): string => {
  if (typeof price === "number") {
    return price.toFixed(2);
  }
  if (typeof price === "string") {
    const parsed = parseFloat(price);
    return isNaN(parsed) ? "0.00" : parsed.toFixed(2);
  }
  return "0.00";
};

interface CartItem {
  id: number;
  product: number;
  product_title: string;
  product_price: number;
  quantity: number;
  total_price: number;
  cover_image?: string;
  stock?: number;
}

interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}

interface ErrorResponse {
  error?: string;
  message?: string;
}

const API_BASE_URL = "http://localhost:8000";

const CartPage = () => {
  const { updateCartItemCount } = useCart();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "info" as "success" | "error" | "info",
    duration: 3000,
  });
  const [updatingItems, setUpdatingItems] = useState<number[]>([]);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE_URL}/cart/`, { withCredentials: true });
      if (res.data && typeof res.data === "object") {
        setCart(res.data);
        const totalQuantity =
          res.data.items?.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) || 0;
        updateCartItemCount(totalQuantity);
      } else {
        showNotification("Failed to load cart data", "error");
      }
    } catch (err) {
      showNotification("Error loading cart", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const showNotification = (
    message: string,
    type: "success" | "error" | "info",
    duration?: number
  ) => {
    let notificationDuration = 3000;
    if (duration) {
      notificationDuration = duration;
    }
    setNotification({
      open: true,
      message,
      type,
      duration: notificationDuration,
    });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleQuantityChange = async (
    productId: number,
    newQuantity: number,
    currentQuantity: number
  ) => {
    if (newQuantity < 0) return;

    try {
      setUpdatingItems((prev) => [...prev, productId]);
      const response = await axios.post(
        `${API_BASE_URL}/cart/`,
        {
          product_id: productId,
          quantity: newQuantity,
          override: "true",
        },
        { withCredentials: true }
      );

      setCart(response.data);
      const totalQuantity =
        response.data.items?.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) || 0;
      updateCartItemCount(totalQuantity);
      showNotification("Quantity updated successfully", "success", 3000);
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      if (error.response?.data?.error) {
        showNotification(error.response.data.error, "error", 6000);
      } else {
        showNotification("Failed to update quantity", "error", 3000);
      }
      fetchCart();
    } finally {
      setUpdatingItems((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      setUpdatingItems((prev) => [...prev, productId]);
      const response = await axios.post(
        `${API_BASE_URL}/cart/`,
        {
          product_id: productId,
          quantity: 0,
          override: "true",
        },
        { withCredentials: true }
      );

      setCart(response.data);
      updateCartItemCount(0);
      showNotification("Item removed from cart", "success", 2000);
    } catch (err) {
      showNotification("Failed to remove item", "error", 3000);
      fetchCart();
    } finally {
      setUpdatingItems((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleProceedToCheckout = () => {
    if (cart) {
      navigate("/payment");
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: "100vh", pt: 16, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading cart...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(to bottom right, #fcf9f4, #e8f1fc)", pt: 16, pb: 4 }}>
      <Container>
        <Typography variant="h4" sx={{ fontWeight: "bold", textAlign: "center", mb: 4, color: "#1f2937" }}>
          Your Shopping Cart
        </Typography>

        {cart && cart.items.length > 0 ? (
          <>
            <Grid container spacing={3}>
              {cart.items.map((item) => (
                <Grid item xs={12} key={item.id}>
                  <Card sx={{ display: "flex", p: 2, alignItems: "center", borderRadius: 3, boxShadow: 4, background: "linear-gradient(to right, #fff5f0, #f0f4ff)", transition: "transform 0.3s ease", "&:hover": { transform: "scale(1.02)" } }}>
                    <CardMedia
                      component="img"
                      sx={{ width: 100, height: 100, borderRadius: 2, mr: 2, objectFit: "cover", backgroundColor: "#f8f9fa" }}
                      image={item.cover_image ? `${API_BASE_URL}${item.cover_image}` : "https://via.placeholder.com/100x140?text=No+Image"}
                      alt={item.product_title}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2d3748" }}>{item.product_title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Unit Price: ${formatPrice(item.product_price)}</Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>Quantity:</Typography>
                        <TextField
                          type="number"
                          size="small"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.product, parseInt(e.target.value, 10), item.quantity)}
                          sx={{ width: 70, borderRadius: 2, boxShadow: "0 0 6px rgba(0,0,0,0.1)" }}
                          inputProps={{ min: 0, step: 1 }}
                          disabled={updatingItems.includes(item.product)}
                        />
                        {updatingItems.includes(item.product) && <CircularProgress size={20} sx={{ ml: 1 }} />}
                      </Box>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2d3748", mx: 2 }}>
                      ${formatPrice(item.total_price)}
                    </Typography>
                    <Button
                      onClick={() => handleRemoveItem(item.product)}
                      disabled={updatingItems.includes(item.product)}
                      sx={{
                        background: "linear-gradient(45deg, #fbb6b6, #fbcfe8)",
                        color: "#6b0d0d",
                        fontWeight: "bold",
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background: "linear-gradient(45deg, #fca5a5, #f9a8d4)",
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      {updatingItems.includes(item.product) ? <CircularProgress size={24} color="inherit" /> : "Remove"}
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ textAlign: "right", mt: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2d3748" }}>
                Total: ${formatPrice(cart.total)}
              </Typography>
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  background: "linear-gradient(to right, #f6ad55, #f97316)",
                  color: "white",
                  fontWeight: "bold",
                  px: 3,
                  py: 1,
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(to right, #f97316, #ea580c)",
                    transform: "scale(1.05)",
                  },
                }}
                onClick={handleProceedToCheckout}
              >
                PROCEED TO CHECKOUT
              </Button>
            </Box>
          </>
        ) : (
          <Alert severity="info" sx={{ mt: 6 }}>Your cart is empty.</Alert>
        )}
      </Container>

      <Snackbar
        open={notification.open}
        autoHideDuration={notification.duration}
        onClose={closeNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={closeNotification} severity={notification.type} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CartPage;
