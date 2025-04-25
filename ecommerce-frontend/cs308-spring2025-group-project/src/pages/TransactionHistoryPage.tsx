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

      if (newQuantity === 0) {
        if (response.data && response.data.items && response.data.items.length === 0) {
          setCart({ ...response.data, items: [] });
          updateCartItemCount(0);
        } else {
          setCart(response.data);
          const totalQuantity =
            response.data.items?.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) || 0;
          updateCartItemCount(totalQuantity);
        }
        showNotification("Item removed from cart", "success", 2000);
      } else {
        setCart(response.data);
        const totalQuantity =
          response.data.items?.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) || 0;
        updateCartItemCount(totalQuantity);

        if (newQuantity > currentQuantity) {
          showNotification(`Quantity increased to ${newQuantity}`, "success", 8000);
        } else if (newQuantity < currentQuantity) {
          showNotification(`Quantity decreased to ${newQuantity}`, "info", 3000);
        } else {
          showNotification("Quantity updated successfully", "success", 3000);
        }
      }
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

      if (response.data && response.data.items && response.data.items.length === 0) {
        setCart({ ...response.data, items: [] });
        updateCartItemCount(0);
      } else {
        setCart(response.data);
        const totalQuantity =
          response.data.items?.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) || 0;
        updateCartItemCount(totalQuantity);
      }

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
      <Box
        sx={{
          minHeight: "100vh",
          pt: 16,
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading cart...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #fcf9f4, #e8f1fc)",
        pt: 16,
        pb: 4,
      }}
    >
      <Container>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            mb: 4,
            color: "#1f2937",
            fontFamily: "'Segoe UI', sans-serif",
          }}
        >
          Your Shopping Cart
        </Typography>

        {/* Rest of the component remains unchanged */}
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
