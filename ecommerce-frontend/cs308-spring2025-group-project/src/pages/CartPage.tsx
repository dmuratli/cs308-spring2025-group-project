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
import { getCSRFToken } from "../context/AuthContext";

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
  discount_percent: number;
  discounted_price: string;
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
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
  });

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
    } catch {
      showNotification("Error loading cart", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Load existing shipping info from profile
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/profile/`, { withCredentials: true });
        const d = res.data;
        setShippingInfo({
          fullName:     d.name || "",
          phoneNumber:  d.phone_number || "",
          addressLine1: d.address_line1 || "",
          addressLine2: d.address_line2 || "",
          city:         d.city || "",
          postalCode:   d.postal_code || "",
        });
      } catch {
        // ignore if not authenticated
      }
    })();
  }, []);

  useEffect(() => {
    fetchCart();
  }, []);

  const showNotification = (
    message: string,
    type: "success" | "error" | "info",
    duration?: number
  ) => {
    setNotification({
      open: true,
      message,
      type,
      duration: duration || 3000,
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
    } catch {
      showNotification("Failed to remove item", "error", 3000);
      fetchCart();
    } finally {
      setUpdatingItems((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleProceedToCheckout = async () => {
    const { fullName, phoneNumber, addressLine1, city, postalCode } = shippingInfo;
    if (!fullName || !phoneNumber || !addressLine1 || !city || !postalCode) {
      showNotification("Please fill in all required shipping fields", "error", 4000);
      return;
    }

    try {
      const accessToken = localStorage.getItem("access_token");
      
      // save to user profile
      const response = await fetch("http://localhost:8000/profile/edit/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
          "Authorization": `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          name:           fullName,
          phone_number:   phoneNumber,
          address_line1:  addressLine1,
          address_line2:  shippingInfo.addressLine2,
          city:           city,
          postal_code:    postalCode,
        }),
      });
    } catch {
      showNotification("Failed to save shipping info", "error", 3000);
      return;
    }

    navigate("/payment");
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
          }}
        >
          Your Shopping Cart
        </Typography>

        {cart && cart.items.length > 0 ? (
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
                      transition: "transform 0.3s ease",
                      "&:hover": { transform: "scale(1.02)" },
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
                        item.cover_image
                          ? `${API_BASE_URL}${item.cover_image}`
                          : "https://via.placeholder.com/100x140?text=No+Image"
                      }
                      alt={item.product_title}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", color: "#2d3748" }}
                      >
                        {item.product_title}
                      </Typography>
                      {item.discount_percent > 0 ? (
                        <Box sx={{ mb: 1 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textDecoration: "line-through" }}
                          >
                            Unit Price: ${formatPrice(item.product_price)}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            Discounted Unit Price: ${formatPrice(parseFloat(item.discounted_price))}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Unit Price: ${formatPrice(item.product_price)}
                        </Typography>
                      )}
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          Quantity:
                        </Typography>
                        <TextField
                          type="number"
                          size="small"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.product,
                              parseInt(e.target.value, 10),
                              item.quantity
                            )
                          }
                          sx={{ width: 70 }}
                          inputProps={{ min: 0, step: 1 }}
                          disabled={updatingItems.includes(item.product)}
                        />
                        {updatingItems.includes(item.product) && (
                          <CircularProgress size={20} sx={{ ml: 1 }} />
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ mx: 2, textAlign: "right" }}>
                      {item.discount_percent > 0 ? (
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{ textDecoration: "line-through", mr: 1 }}
                          >
                            ${formatPrice(item.product_price * item.quantity)}
                          </Typography>
                          <Typography
                            component="span"
                            variant="h6"
                            fontWeight="bold"
                          >
                            ${formatPrice(parseFloat(item.discounted_price) * item.quantity)}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="h6" fontWeight="bold">
                          ${formatPrice(item.total_price)}
                       </Typography>
                      )}
                    </Box>
                    <Button
                      onClick={() => handleRemoveItem(item.product)}
                      disabled={updatingItems.includes(item.product)}
                      sx={{
                        background: "linear-gradient(45deg, #fbb6b6, #fbcfe8)",
                        color: "#6b0d0d",
                        fontWeight: "bold",
                        borderRadius: 2,
                        "&:hover": {
                          transform: "scale(1.05)",
                          background: "linear-gradient(45deg, #fca5a5, #f9a8d4)",
                        },
                      }}
                    >
                      Remove
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Shipping Info Form */}
            <Box
              sx={{
                mt: 6,
                p: 4,
                borderRadius: 5,
                background: "linear-gradient(to right, #fdf6ec, #f0f4ff)",
                boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
                animation: "fadeIn 1s ease-in-out",
                "@keyframes fadeIn": {
                  from: { opacity: 0, transform: "translateY(20px)" },
                  to: { opacity: 1, transform: "translateY(0)" },
                },
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}
              >
                Shipping Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Full Name"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Phone Number"
                    name="phoneNumber"
                    value={shippingInfo.phoneNumber}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Address Line 1"
                    name="addressLine1"
                    value={shippingInfo.addressLine1}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Address Line 2"
                    name="addressLine2"
                    value={shippingInfo.addressLine2}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="City"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Postal Code"
                    name="postalCode"
                    value={shippingInfo.postalCode}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ textAlign: "right", mt: 4 }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", color: "#2d3748" }}
              >
                Total: $
                {formatPrice(
                  cart.items.reduce(
                    (sum, it) => sum + parseFloat(it.discounted_price) * it.quantity,
                    0
                  )
                )}
              </Typography>
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  background: "linear-gradient(to right, #f6ad55, #f97316)",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: 3,
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
          <Alert severity="info" sx={{ mt: 6 }}>
            Your cart is empty.
          </Alert>
        )}
      </Container>

      <Snackbar
        open={notification.open}
        autoHideDuration={notification.duration}
        onClose={closeNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeNotification}
          severity={notification.type}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CartPage;