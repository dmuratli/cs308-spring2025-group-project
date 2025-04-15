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
  Toolbar 
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
  }

  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    type: 'info'
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
    
    // Stock check
    if (product.stock <= 0) {
      setNotification({
        open: true,
        message: 'This product is out of stock.',
        type: 'error'
      });
      return;
    }
    
    setLoading(true);
    console.log("Adding product to cart:", product);
    
    const success = await addToCart(product.id, 1);
    
    if (success) {
      console.log("Product added to cart successfully");
      setNotification({
        open: true,
        message: 'Product added to cart successfully!',
        type: 'success'
      });
      
      // Refresh product data with updated stock information
      axios.get(`http://localhost:8000/api/products/${slug}/`, { withCredentials: true })
        .then((response) => setProduct(response.data))
        .catch((error) => console.error("Error refreshing product data:", error));
    } else {
      console.error("Failed to add product to cart");
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
      {/* Add MUI Toolbar to create spacing equal to the AppBar's height */}
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
            <Typography variant="body1" color="text.secondary">
              {product.description}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={2}>
              <strong>Genre:</strong> {product.genre} | <strong>Language:</strong> {product.language}
            </Typography>
            <Typography variant="h5" color="primary" mt={3}>
            ${product.price}
            </Typography>

            <Typography variant="body2" color={product.stock > 0 ? "green" : "error"} mt={2}>
              <strong>In Stock:</strong> {product.stock} {product.stock === 1 ? "copy" : "copies"}
            </Typography>
            {product.stock <= 3 && product.stock > 0 && (
            <Typography variant="body2" color="warning.main" fontWeight="bold" mt={1}>
              Hurry! Only {product.stock} left in stock.
            </Typography>
            )}


            <Typography variant="body2" color="text.secondary" mt={1} mb={2}>
              <strong>Stock Status:</strong> {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </Typography>
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
