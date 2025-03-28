import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Container, Grid, Typography, Card, CardContent, CardMedia, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const ProductPage: React.FC = () => {
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

  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/products/") // Adjust the endpoint to match your backend
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const formatUrl = (title: string, author: string) => {
    return `/products/${title.toLowerCase().replace(/\s+/g, "-")}-${author.toLowerCase().replace(/\s+/g, "-")}`;
  };
  

  return (
    <Box>
      <Navbar />
      <Container sx={{ my: 10 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={5}>
          Our Book Collection
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {products.map((product) => (
            <Grid item key={product.title} xs={12} sm={6} md={4} lg={3}>
              <Card
                sx={{ boxShadow: 5, borderRadius: 3, transition: "all 0.3s", "&:hover": { transform: "scale(1.02)" } }}
                onClick={() => navigate(formatUrl(product.title, product.author))}
              >
                <CardMedia
                  component="img"
                  height="250"
                  image={product.cover_image || "https://via.placeholder.com/250"}
                  alt={product.title}
                  sx={{ borderRadius: "8px 8px 0 0" }}
                />
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {product.title}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    by {product.author}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {product.genre} | {product.language}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ height: 40, overflow: "hidden" }}>
                    {product.description.length > 80 ? product.description.substring(0, 80) + "..." : product.description}
                  </Typography>
                  <Typography variant="h6" color="primary" mt={2}>
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
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ProductPage;
