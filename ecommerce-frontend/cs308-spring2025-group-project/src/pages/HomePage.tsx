import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/products/")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Failed to fetch products", err));
  }, []);

  const newArrivals = [...products]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 3); // You can increase this if needed

  return (
    <Box>
      <Navbar />

      {/* Hero Section */}
      <Box
        sx={{
          height: "400px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          color: "black",
          p: 2,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage:
              "url('https://i.ibb.co/CssQMFQj/DALL-E-2025-03-06-14-57-55-A-beautiful-and-immersive-book-themed-background-image-for-an-online-book.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.3,
            zIndex: -1,
          }}
        />
        <Typography variant="h4" fontWeight="bold">
          A Book Can Change Your Life
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/products")}
          sx={{
            mt: 2,
            backgroundColor: "#EF977F",
            color: "white",
            px: 4,
            py: 1,
            fontSize: "1rem",
            transition: "all 0.3s",
            "&:hover": {
              backgroundColor: "#d46c4e",
              transform: "scale(1.05)",
            },
          }}
        >
          Shop Now
        </Button>
      </Box>

      {/* Bestseller Section */}
      <Container sx={{ my: 5 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={3}>
          Bestsellers
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          mb={4}
        >
          Discover our top-rated books loved by our readers!
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {[...Array(3)].map((_, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                <CardMedia
                  sx={{ height: 200, backgroundColor: "#e0e0e0" }}
                />
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">
                    Book Title
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sample book description.
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}
                  >
                    <Button
                      variant="outlined"
                      sx={{
                        transition: "all 0.3s",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      Learn More
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Review Section */}
      <Box sx={{ backgroundColor: "#f9f9f9", py: 5 }}>
        <Container>
          <Typography variant="h4" fontWeight="bold" textAlign="center" mb={3}>
            What Our Readers Say
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {[
              {
                text: '"This bookstore changed my reading experience! Amazing selection and fast delivery."',
                name: "- John Doe",
              },
              {
                text: '"Great books, fantastic service, and unbeatable prices!"',
                name: "- Jane Smith",
              },
            ].map((review, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Box display="flex" alignItems="center" gap={3}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      backgroundColor: "#dcdcdc",
                      borderRadius: "50%",
                      flexShrink: 0,
                    }}
                  />
                  <Box>
                    <Typography variant="body1">{review.text}</Typography>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {review.name}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* New Arrivals Section (Real Data) */}
      <Container sx={{ my: 5 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={3}>
          New Arrivals
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          mb={4}
        >
          Get the latest books just added to our store!
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {newArrivals.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4}>
              <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.cover_image || "https://via.placeholder.com/250x350?text=No+Image"}
                  alt={product.title}
                />
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" noWrap>
                    {product.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {product.genre}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" mt={1}>
                    {product.price}₺
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/products/${product.slug}`)}
                      sx={{
                        transition: "all 0.3s",
                        "&:hover": {
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      Learn More
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: "#EF977F",
          color: "white",
          textAlign: "center",
          p: 4,
          mt: 5,
          borderRadius: "10px",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Start Your Reading Journey
        </Typography>
        <Typography variant="body1" mt={1}>
          Find your next favorite book and embark on an adventure through pages.
        </Typography>
        <Button
          variant="contained"
          sx={{
            mt: 2,
            backgroundColor: "white",
            color: "#EF977F",
            transition: "all 0.3s",
            "&:hover": {
              backgroundColor: "#f5f5f5",
              transform: "scale(1.05)",
            },
          }}
        >
          Contact Us
        </Button>
      </Box>
    </Box>
  );
};

export default HomePage;
