import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  CardActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";

const ProductPage: React.FC = () => {
  interface Product {
    title: string;
    author: string;
    genre: string;
    language: string;
    price: number;
    stock: number;
    cover_image?: string;
    rating: number;
    canRate: boolean;
  }

  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/products/")
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const formatUrl = (title: string, author: string) => {
    return `/product/${title.toLowerCase().replace(/\s+/g, "-")}_${author
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
  };

  return (
    <Box>
      <Navbar />
      <Container maxWidth="lg" sx={{ my: 10, px: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={5}>
          Our Book Collection
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
          {products.map((product) => (
            <Grid
              item
              key={`${product.title}-${product.author}`}
              xs={12}
              sm={6}
              md={4}
              lg={3}
            >
              <Card
                sx={{
                  boxShadow: 5,
                  borderRadius: 3,
                  cursor: "pointer",
                }}
                onClick={() => navigate(formatUrl(product.title, product.author))}
              >
                <CardMedia
                  component="img"
                  image={product.cover_image || "https://via.placeholder.com/250"}
                  alt={product.title}
                  sx={{
                    width: "100%",
                    height: { xs: 200, sm: 250 },
                    objectFit: "cover",
                    borderRadius: "8px 8px 0 0",
                  }}
                />
                <CardContent sx={{ textAlign: "center", p: 2 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {product.title}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    by {product.author}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {product.genre} | {product.language}
                  </Typography>
                  <Typography variant="h6" color="primary" mt={2}>
                    ${product.price}
                  </Typography>
                  <Button variant="contained" fullWidth disabled={product.stock === 0}>
                    {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                  </Button>
                </CardContent>
                <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                  <Button size="small" variant="outlined" color="secondary">
                    Wishlist
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ProductPage;
