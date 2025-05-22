// src/pages/admin/BookDetailsPage.tsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Rating,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Snackbar,
  Alert,
  Toolbar,
  Grid,
  Divider,
  Paper,
  CircularProgress,
  Avatar,
} from "@mui/material";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import AddToWishlistButton from "../components/AddToWishlistButton";

interface Review {
  id: number;
  stars: number;
  review_text: string;
  created_at: string;
  username?: string;
}

interface Product {
  id: number;
  title: string;
  author: string;
  genre: number;          // FK id
  genre_name: string;     // human-readable name
  language: string;
  description: string;
  price: number;
  discount_percent: number;
  stock: number;
  cover_image?: string;
  isbn?: string;
  pages?: number;
  publisher?: string;
  publication_date?: string;
  rating: number;
}

const BookDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ open: false, message: "", type: "info" });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const token = localStorage.getItem("access");

  const fetchProduct = async () => {
    if (!slug) return;
    try {
      const res = await axios.get<Product>(
        `http://localhost:8000/api/products/${slug}/`,
        { withCredentials: true }
      );
      const raw = res.data as any;
      setProduct({
        ...raw,
        price: parseFloat(raw.price),
        discount_percent: parseFloat(raw.discount_percent),
      });
    } catch (err) {
      console.error("Error fetching product:", err);
    }
  };

  const fetchReviews = async (prodId: number) => {
    setReviewsLoading(true);
    try {
      const res = await axios.get<Review[]>(
        `http://localhost:8000/api/reviews/?product=${prodId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (product?.id) {
      fetchReviews(product.id);
    }
  }, [product?.id]);

  const handleAddToCart = async () => {
    if (!product || loading) return;
    if (product.stock <= 0) {
      setNotification({
        open: true,
        message: "This product is out of stock.",
        type: "error",
      });
      return;
    }
    setLoading(true);
    const ok = await addToCart(product.id, 1);
    setNotification({
      open: true,
      message: ok
        ? "Product added to cart successfully!"
        : "There was a problem adding the product to cart.",
      type: ok ? "success" : "error",
    });
    if (ok) {
      fetchProduct();
    }
    setLoading(false);
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
      setNotification({
        open: true,
        message: "Removed from wishlist",
        type: "info",
      });
    } else {
      await addToWishlist(product.id);
      setNotification({
        open: true,
        message: "Added to wishlist",
        type: "success",
      });
    }
  };

  if (!product) {
    return (
      <Typography textAlign="center" mt={5}>
        <CircularProgress />
      </Typography>
    );
  }

  return (
    <Box>
      <Navbar />
      <Toolbar />

      <Container sx={{ my: 5 }}>
        <Card
          sx={{
            display: "flex",
            boxShadow: 5,
            borderRadius: 3,
            transition: "transform 0.3s ease",
            "&:hover": { transform: "scale(1.02)" },
          }}
        >
          <CardMedia
            component="img"
            height="450"
            image={product.cover_image || "https://via.placeholder.com/450"}
            alt={product.title}
            sx={{ width: "40%", borderRadius: "12px 0 0 12px" }}
          />

          <CardContent sx={{ flex: 1, p: 5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                width: "100%",
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {product.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  by {product.author}
                </Typography>
              </Box>
              <AddToWishlistButton productId={product.id} size="large" />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Rating
                  value={product.rating}
                  precision={0.5}
                  readOnly
                  size="large"
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  {product.rating.toFixed(2)} / 5
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" mt={2}>
              <strong>Genre:</strong> {product.genre_name}{" "}
              | <strong>Language:</strong> {product.language}
            </Typography>

            {product.discount_percent > 0 ? (
              <Box mt={2}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ textDecoration: "line-through" }}
                >
                  ${product.price.toFixed(2)}
                </Typography>
                <Typography variant="h5" color="primary">
                  ${(product.price * (1 - product.discount_percent / 100)).toFixed(2)}
                </Typography>
              </Box>
            ) : (
              <Typography variant="h5" color="primary" mt={2}>
                ${product.price}
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Book Details
            </Typography>

            <Grid container spacing={2}>
              {product.isbn && (
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: "#FFF8F0" }}>
                    <Typography variant="body2">
                      <strong>ISBN:</strong> {product.isbn}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              {product.pages && (
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: "#FFF8F0" }}>
                    <Typography variant="body2">
                      <strong>Pages:</strong> {product.pages}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              {product.publisher && (
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: "#FFF8F0" }}>
                    <Typography variant="body2">
                      <strong>Publisher:</strong> {product.publisher}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              {product.publication_date && (
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: "#FFF8F0" }}>
                    <Typography variant="body2">
                      <strong>Publication Date:</strong>{" "}
                      {new Date(product.publication_date).toLocaleDateString()}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>

            <Typography
              variant="h6"
              fontWeight="bold"
              mt={3}
              gutterBottom
            >
              Description
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {product.description}
            </Typography>

            <Typography
              variant="body2"
              color={product.stock > 0 ? "green" : "error"}
              mt={2}
            >
              <strong>In Stock:</strong> {product.stock}
            </Typography>

            {product.stock <= 3 && product.stock > 0 && (
              <Typography
                variant="body2"
                color="warning.main"
                fontWeight="bold"
                mt={1}
              >
                Hurry! Only {product.stock} left in stock.
              </Typography>
            )}

            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                background: "linear-gradient(to right, #f6ad55, #fbd38d)",
                color: "white",
                fontWeight: "bold",
                fontSize: "1rem",
                py: 1.5,
                borderRadius: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(to right, #f9a826, #f6ad55)",
                  transform: "scale(1.03)",
                },
              }}
              disabled={product.stock === 0 || loading}
              onClick={handleAddToCart}
            >
              {loading
                ? "Adding…"
                : product.stock > 0
                ? "ADD TO CART"
                : "OUT OF STOCK"}
            </Button>
          </CardContent>
        </Card>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Reviews
          </Typography>

          {reviewsLoading ? (
            <CircularProgress />
          ) : reviews.length === 0 ? (
            <Alert severity="info">No reviews yet.</Alert>
          ) : (
            reviews.map((r) => (
              <Paper
                key={r.id}
                elevation={3}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 4,
                  background: "linear-gradient(to right, #fef6e4, #f9f3ff)",
                  transition: "all 0.3s",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "scale(1.015)",
                    background: "linear-gradient(to right, #ffecd2, #fcb69f)",
                  },
                }}
              >
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      fontWeight: "bold",
                      bgcolor:
                        r.stars >= 4
                          ? "#66bb6a"
                          : r.stars === 3
                          ? "#ffa726"
                          : "#ef5350",
                      mr: 2,
                    }}
                  >
                    {r.stars}
                  </Avatar>
                  <Typography fontWeight="bold" fontSize="1.1rem" mr={2}>
                    {"🌟".repeat(r.stars)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mr={1}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="bold">
                    – {r.username || "Anonymous"}
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{ ml: 1.5, fontSize: "1.05rem", color: "#333" }}
                >
                  {r.review_text}
                </Typography>
              </Paper>
            ))
          )}
        </Box>
      </Container>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={notification.type}
          onClose={() => setNotification((p) => ({ ...p, open: false }))}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookDetailsPage;