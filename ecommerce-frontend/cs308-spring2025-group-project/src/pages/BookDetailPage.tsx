import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Container, Typography, Card, CardContent, CardMedia, Button } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const BookDetailPage: React.FC = () => {
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

  const { title, author } = useParams<{ title: string; author: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const navigate = useNavigate();
  alert("merhaba")

  useEffect(() => {
    console.log(title)
    console.log(author)

    if (title && author) {
      axios
        .get(`http://localhost:8000/api/products/${title}-${author}/`)
        .then((response) => {
          console.log(response.data)
          setProduct(response.data)
        })
        .catch((error) => console.error("Error fetching product:", error));

    }
  }, [title, author]);

  if (!product) {
    return <Typography textAlign="center" mt={5}>Loading...</Typography>;
  }

  return (
    <Box>
      <Navbar />
      <Container sx={{ my: 5 }}>
        <Card
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            boxShadow: 3,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <CardMedia
            component="img"
            image={product.cover_image || "https://via.placeholder.com/450"}
            alt={product.title}
            sx={{
              width: { xs: "100%", md: "40%" },
              height: { xs: 300, md: "auto" },
              objectFit: "cover",
            }}
          />
          <CardContent sx={{ flex: 1, p: 5 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {product.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              by {product.author}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {product.description}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>Genre:</strong> {product.genre} | <strong>Language:</strong> {product.language}
            </Typography>
            <Typography variant="h5" color="primary" sx={{ mb: 3 }}>
              ${product.price}
            </Typography>
            <Button
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "#EF977F",
                color: "white",
                "&:hover": { backgroundColor: "#d46c4e" },
              }}
              disabled={product.stock === 0}
            >
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                mt: 2,
                borderColor: "#EF977F",
                color: "#EF977F",
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}
              onClick={() => navigate("/products")}
            >
              Back to Products
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default BookDetailPage;
