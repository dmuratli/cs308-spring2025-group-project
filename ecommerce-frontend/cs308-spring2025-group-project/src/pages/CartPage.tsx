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
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext"; // Import useCart hook

// Helper function to format numbers as price strings
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

// Cart item interface
interface CartItem {
  id: number;
  product: number;
  product_title: string;
  product_price: number;
  quantity: number;
  total_price: number;
}

// Cart interface
interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}

// Error response interface
interface ErrorResponse {
  error?: string;
  message?: string;
}

// API base URL
const API_BASE_URL = "http://localhost:8000";

const CartPage = () => {
  const { updateCartItemCount } = useCart();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info";
    duration: number;
  }>({
    open: false,
    message: "",
    type: "info",
    duration: 3000,
  });
  const [updatingItems, setUpdatingItems] = useState<number[]>([]);

  // Fetch the cart data from the backend API
  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE_URL}/cart/`, { withCredentials: true });
      console.log("Cart data:", res.data);
      if (res.data && typeof res.data === "object") {
        setCart(res.data);

        // Calculate total quantity for the badge update
        const totalQuantity =
          res.data.items?.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) || 0;
        updateCartItemCount(totalQuantity);
      } else {
        console.error("Unexpected API response:", res.data);
        showNotification("Failed to load cart data", "error");
      }
    } catch (err) {
      console.error("Error loading cart:", err);
      showNotification("Error loading cart", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Helper to show notifications with configurable duration
  const showNotification = (
    message: string,
    type: "success" | "error" | "info",
    duration?: number
  ) => {
    let notificationDuration = 3000; // Default duration
    if (duration) {
      notificationDuration = duration;
    } else if (type === "success" && message.includes("increased")) {
      notificationDuration = 10000;
    } else if (type === "success" && message.includes("removed")) {
      notificationDuration = 10000;
    }
    setNotification({
      open: true,
      message,
      type,
      duration: notificationDuration,
    });
  };

  const closeNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  // Handle quantity change via API (override: true to replace the quantity exactly)
  const handleQuantityChange = async (
    productId: number,
    newQuantity: number,
    currentQuantity: number
  ) => {
    if (newQuantity < 0) return; // Prevent negative values

    try {
      setUpdatingItems((prev) => [...prev, productId]);

      // Adding override: "true" forces the server to update the quantity directly
      const response = await axios.post(
        `${API_BASE_URL}/cart/`,
        {
          product_id: productId,
          quantity: newQuantity,
          override: "true"
        },
        { withCredentials: true }
      );

      // If new quantity is 0, backend removes the item; update UI accordingly.
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
      console.error("Error updating quantity:", err);
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

  // Handler for quantity input changes
  const handleQuantityInputChange = (
    productId: number,
    value: string,
    currentQuantity: number
  ) => {
    const newQty = parseInt(value, 10);
    if (!isNaN(newQty) && newQty >= 0) {
      handleQuantityChange(productId, newQty, currentQuantity);
    }
  };

  // Handler for removing an item (by setting quantity to 0)
  const handleRemoveItem = async (productId: number) => {
    try {
      setUpdatingItems((prev) => [...prev, productId]);
      const response = await axios.post(
        `${API_BASE_URL}/cart/`,
        {
          product_id: productId,
          quantity: 0, // Quantity 0 indicates removal
          override: "true" // Optional, but ensures removal action
        },
        { withCredentials: true }
      );

      console.log("Item removal response:", response.data);

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
      console.error("Error removing item:", err);
      showNotification("Failed to remove item", "error", 3000);
      fetchCart();
    } finally {
      setUpdatingItems((prev) => prev.filter((id) => id !== productId));
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
        background: "linear-gradient(135deg, #f0f4f8, #d9e2ec)",
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
            color: "#1a202c",
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
                      borderRadius: 2,
                      boxShadow: 3,
                    }}
                  >
                    <CardMedia
                      component="img"
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: 2,
                        mr: 2,
                        objectFit: "contain",
                        backgroundColor: "#f8f9fa",
                      }}
                      image={`${API_BASE_URL}/media/book_covers/${item.product}.jpg`}
                      alt={item.product_title}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/100?text=Book";
                      }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1a202c" }}>
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
                            handleQuantityInputChange(item.product, e.target.value, item.quantity)
                          }
                          sx={{ width: 70 }}
                          // inputProps: artış/azalış oklarının 1 birim adım atmasını sağlar
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
                      sx={{ fontWeight: "bold", color: "#1a202c", mx: 2 }}
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
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1a202c" }}>
                Total: ${formatPrice(cart.total)}
              </Typography>
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  backgroundColor: "#4299E1",
                  "&:hover": {
                    backgroundColor: "#2B6CB0",
                  },
                }}
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
