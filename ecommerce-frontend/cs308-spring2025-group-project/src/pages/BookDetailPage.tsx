import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Container,
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
  Paper
} from "@mui/material";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

const BookDetailsPage: React.FC = () => {
  interface Product {
    title: string;
    author: string;
    genre: string;
    language: string;
    description: string;
    price: number;
    stock: number;
    cover_image?: string;
    id?: number;
    isbn?: string;
    pages?: number;
    publisher?: string;
    publication_date?: string;
  }

  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'info'
  });

  useEffect(() => {
    if (slug) {
      axios
        .get(`http://localhost:8000/api/products/${slug}/`, { withCredentials: true })
        .then((response) => setProduct(response.data))
        .catch((error) => console.error("Error fetching product:", error));
    }
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product || !product.id) return;
    if (loading) return;

    if (product.stock <= 0) {
      setNotification({
        open: true,
        message: 'This product is out of stock.',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    const success = await addToCart(product.id, 1);

    if (success) {
      setNotification({
        open: true,
        message: 'Product added to cart successfully!',
        type: 'success'
      });
      axios.get(`http://localhost:8000/api/products/${slug}/`, { withCredentials: true })
        .then((response) => setProduct(response.data))
        .catch((error) => console.error("Error refreshing product data:", error));
    } else {
      setNotification({
        open: true,
        message: 'There was a problem adding the product to cart.',
        type: 'error'
      });
    }

    setLoading(false);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (!product) {
    return <Typography textAlign="center" mt={5}>Loading...</Typography>;
  }

  return (
    <Box>
      <Navbar />
      <Toolbar />
      <Container sx={{ my: 5 }}>
        <Card sx={{ display: "flex", boxShadow: 5, borderRadius: 3 }}>
          <CardMedia
            component="img"
            height="450"
            image={product.cover_image || "https://via.placeholder.com/450"}
            alt={product.title}
            sx={{ width: "40%", borderRadius: "3px 0 0 3px" }}
          />
          <CardContent sx={{ flex: 1, p: 5 }}>
            <Typography variant="h4" fontWeight="bold">
              {product.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              by {product.author}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={2}>
              <strong>Genre:</strong> {product.genre} | <strong>Language:</strong> {product.language}
            </Typography>
            <Typography variant="h5" color="primary" mt={2}>
              ${product.price}
            </Typography>

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Book Details
            </Typography>

            <Grid container spacing={2}>
              {product.isbn && (
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: '#FFF8F0' }}>
                    <Typography variant="body2"><strong>ISBN:</strong> {product.isbn}</Typography>
                  </Paper>
                </Grid>
              )}
              {product.pages && (
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: '#FFF8F0' }}>
                    <Typography variant="body2"><strong>Pages:</strong> {product.pages}</Typography>
                  </Paper>
                </Grid>
              )}
              {product.publisher && (
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: '#FFF8F0' }}>
                    <Typography variant="body2"><strong>Publisher:</strong> {product.publisher}</Typography>
                  </Paper>
                </Grid>
              )}
              {product.publication_date && (
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: '#FFF8F0' }}>
                    <Typography variant="body2"><strong>Publication Date:</strong> {new Date(product.publication_date).toLocaleDateString()}</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>

            <Typography variant="h6" fontWeight="bold" gutterBottom mt={3}>
              Description
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {product.description}
            </Typography>

            <Typography variant="body2" color={product.stock > 0 ? "green" : "error"} mt={2}>
              <strong>In Stock:</strong> {product.stock} {product.stock === 1 ? "copy" : "copies"}
            </Typography>
            {product.stock <= 3 && product.stock > 0 && (
              <Typography variant="body2" color="warning.main" fontWeight="bold" mt={1}>
                Hurry! Only {product.stock} left in stock.
              </Typography>
            )}

            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                backgroundColor: "#EF977F",
                color: "white",
                "&:hover": { backgroundColor: "#d46c4e" },
              }}
              disabled={product.stock === 0 || loading}
              onClick={handleAddToCart}
            >
              {loading ? 'Adding...' : product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
          </CardContent>
        </Card>
      </Container>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.type}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookDetailsPage;
