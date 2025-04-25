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
        background: "linear-gradient(to bottom right, #fdf6f0, #e8f0fe)",
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
            color: "#2d3748",
          }}
        >
          Your Shopping Cart
        </Typography>

        {cart && cart.items && cart.items.length > 0 ? (
          <>
            <Grid container spacing={3}>
              {cart.items.map((item) => (
                <Grid item xs={12} key={item.id}>
                  <Card
                    sx={{
                      display: "flex",
                      p: 2,
                      alignItems: "center",
                      borderRadius: 3,
                      boxShadow: 4,
                      background: "linear-gradient(to right, #fff5f0, #f0f4ff)",
                    }}
                  >
                    <CardMedia
                      component="img"
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: 2,
                        mr: 2,
                        objectFit: "cover",
                        backgroundColor: "#f8f9fa",
                      }}
                      image={
                        item.cover_image && item.cover_image.includes("http")
                          ? item.cover_image
                          : item.cover_image
                          ? `${API_BASE_URL}${item.cover_image}`
                          : "https://via.placeholder.com/100x140?text=No+Image"
                      }
                      alt={item.product_title}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2d3748" }}>
                        {item.product_title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Unit Price: ${formatPrice(item.product_price)}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          Quantity:
                        </Typography>
                        <TextField
                          type="number"
                          size="small"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(item.product, parseInt(e.target.value, 10), item.quantity)
                          }
                          sx={{ width: 70 }}
                          inputProps={{
                            min: 0,
                            step: 1,
                          }}
                          disabled={updatingItems.includes(item.product)}
                        />
                        {updatingItems.includes(item.product) && (
                          <CircularProgress size={20} sx={{ ml: 1 }} />
                        )}
                      </Box>
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "#2d3748", mx: 2 }}
                    >
                      ${formatPrice(item.total_price)}
                    </Typography>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleRemoveItem(item.product)}
                      disabled={updatingItems.includes(item.product)}
                    >
                      {updatingItems.includes(item.product) ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "REMOVE"
                      )}
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ textAlign: "right", mt: 4, pr: 2 }}>
              {cart.items.some((item) => item.stock !== undefined && item.quantity > item.stock) && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Some items in your cart exceed available stock. Please adjust quantities.
                </Alert>
              )}
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2d3748" }}>
                Total: ${formatPrice(cart.total)}
              </Typography>
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  backgroundColor: "#EF977F",
                  color: "white",
                  fontWeight: "bold",
                  px: 3,
                  "&:hover": {
                    backgroundColor: "#d46c4e",
                  },
                }}
                onClick={handleProceedToCheckout}
                disabled={cart.items.some((item) => item.stock !== undefined && item.quantity > item.stock)}
              >
                PROCEED TO CHECKOUT
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: "center", mt: 8 }}>
            <Card
              sx={{
                p: 4,
                borderRadius: 2,
                boxShadow: 3,
                display: "inline-block",
              }}
            >
              <Box sx={{ mb: 2 }}>
                <CardMedia
                  component="img"
                  image="/cartimage.png"
                  alt="Empty Cart"
                  sx={{ width: 160, mx: "auto" }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/160?text=Empty+Cart";
                  }}
                />
              </Box>
              <Typography variant="h6" sx={{ mb: 2, color: "#1a202c" }}>
                Your cart is currently empty.
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to="/"
                sx={{
                  backgroundColor: "#EF977F",
                  color: "#fff",
                  px: 3,
                  py: 1,
                  "&:hover": {
                    backgroundColor: "#d46c4e",
                  },
                }}
              >
                Continue Shopping
              </Button>
            </Card>
          </Box>
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
