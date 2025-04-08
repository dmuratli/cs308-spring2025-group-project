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
  Rating,
  Fade,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AddToCartButton from "../components/AddToCartButton";
import axios from "axios";

const ProductPage: React.FC = () => {
  interface Product {
    id: number; // Eksik olan id alanını ekledik
    title: string;
    author: string;
    genre: string;
    language: string;
    description: string;
    price: number;
    stock: number;
    cover_image?: string;
    rating: number;
    canRate: boolean;
    pages: number;
    created_at: string;
    ordered_count: number;
  }

  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();
  const [sortOption, setSortOption] = useState<string>("");

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/products/")
      .then((response) => {
        console.log("API Response Product Sample:", response.data[0]); // İlk ürünü görelim
        setProducts(response.data);
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []); // useEffect'i doğru şekilde kapattık ve dependency array ekledik

  const formatUrl = (title: string, author: string) => {
    return `/products/${title.toLowerCase().replace(/\s+/g, "-")}-${author.toLowerCase().replace(/\s+/g, "-")}`;
  };

  const handleRatingChange = (index: number, newValue: number | null) => {
    if (newValue === null) return;
    setProducts((prevProducts) => {
      const updated = [...prevProducts];
      updated[index] = { ...updated[index], rating: newValue };
      return updated;
    });
  };

  const sortedProducts = () => {
    let sorted = [...products];

    if (sortOption === "") return products;

    if (sortOption === "price-low") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-high") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortOption === "pages-low") {
      sorted.sort((a, b) => (a.pages ?? 0) - (b.pages ?? 0));
    } else if (sortOption === "pages-high") {
      sorted.sort((a, b) => (b.pages ?? 0) - (a.pages ?? 0));
    } else if (sortOption === "newest") {
      sorted.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    } else if (sortOption === "oldest") {
      sorted.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
    } else if (sortOption === "popularity") {
      sorted.sort((a, b) => (b.ordered_count ?? 0) - (a.ordered_count ?? 0));
    }
    return sorted;
  };

  return (
    <Box>
      <Navbar />
      <Container maxWidth="lg" sx={{ my: 10, px: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={5}>
          Our Book Collection
        </Typography>

        {/* Sorting Dropdown */}
        <Box display="flex" justifyContent="center" mb={4}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="sort-select-label">Sort By</InputLabel>
            <Select
              labelId="sort-select-label"
              value={sortOption}
              label="Sort By"
              onChange={(e) => setSortOption(e.target.value)}
            >
              <MenuItem value="popularity">Popularity</MenuItem>
              <MenuItem value="price-low">Price: Low to High</MenuItem>
              <MenuItem value="price-high">Price: High to Low</MenuItem>
              <MenuItem value="pages-low">Pages: Low to High</MenuItem>
              <MenuItem value="pages-high">Pages: High to Low</MenuItem>
              <MenuItem value="newest">Newest Arrivals</MenuItem>
              <MenuItem value="oldest">Oldest Arrivals</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
          {sortedProducts().map((product, index) => (
            <Grid
              item
              key={`${product.title}-${product.author}`}
              xs={12}
              sm={6}
              md={4}
              lg={3}
            >
              <Fade in={true} timeout={1000} style={{ transitionDelay: `${index * 200}ms` }}>
                <Card
                  sx={{
                    boxShadow: 5,
                    borderRadius: 3,
                    cursor: "pointer",
                    position: "relative",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: "0 0 15px 4px #EF977F",
                    },
                    "&:hover .product-image": {
                      transform: "scale(1.05)",
                    },
                  }}
                  onClick={() => navigate(formatUrl(product.title, product.author))}
                >
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      className="product-image"
                      image={product.cover_image || "https://via.placeholder.com/250"}
                      alt={product.title}
                      sx={{
                        width: "100%",
                        height: { xs: 200, sm: 250 },
                        objectFit: "cover",
                        borderRadius: "8px 8px 0 0",
                        transition: "transform 0.3s",
                      }}
                    />
                    {product.stock === 0 && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          bgcolor: "rgba(0, 0, 0, 0.5)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "1.5rem",
                          fontWeight: "bold",
                          borderRadius: "8px 8px 0 0",
                        }}
                      >
                        Out of Stock
                      </Box>
                    )}
                  </Box>
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
                    {product.canRate ? (
                      <Rating
                        name={`rating-${index}`}
                        value={product.rating}
                        onChange={(event, newValue) => handleRatingChange(index, newValue)}
                      />
                    ) : (
                      <Rating name={`rating-${index}`} value={product.rating} readOnly />
                    )}
                    <Typography variant="h6" color="primary" mt={2}>
                      ${product.price}
                    </Typography>
                    <AddToCartButton
                      productId={product.id || index + 1} // ID varsa kullan, yoksa index+1 kullan
                      fullWidth
                      disabled={product.stock === 0}
                      buttonText={product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    />
                  </CardContent>
                  <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      startIcon={<FavoriteBorderIcon />}
                    >
                      Wishlist
                    </Button>
                  </CardActions>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ProductPage;