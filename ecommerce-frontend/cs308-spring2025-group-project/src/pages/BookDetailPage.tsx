import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Container, Typography, Card, CardContent, CardMedia, Button } from "@mui/material";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

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
  }

  const { slug } = useParams<{ slug: string }>();

  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (slug) {
      axios
        .get(`http://localhost:8000/api/products/${slug}/`)
        .then((response) => setProduct(response.data))
        .catch((error) => console.error("Error fetching product:", error));
    }
  }, [slug]);
  

  if (!product) {
    return <Typography textAlign="center" mt={5}>Loading...</Typography>;
  }

  return (
    <Box>
      <Navbar />
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
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2, backgroundColor: "#EF977F", color: "white", "&:hover": { backgroundColor: "#d46c4e" } }}
              disabled={product.stock === 0}
            >
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default BookDetailsPage;
