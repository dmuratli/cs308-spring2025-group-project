// ProductPage.tsx
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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Slider,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Paper
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
  const [sortOption, setSortOption] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/products/")
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const handleRatingChange = (index: number, newValue: number | null) => {
    if (newValue === null) return;
    setProducts((prevProducts) => {
      const updated = [...prevProducts];
      updated[index] = { ...updated[index], rating: newValue };
      return updated;
    });
  };

  // For title,author search
  const [searchTerm, setSearchTerm] = useState<string>("");

  // For price range filter
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);


  const genres = ["All", ...Array.from(new Set(products.map((p) => p.genre)))];
  const languages = ["All", ...Array.from(new Set(products.map((p) => p.language)))];


  // default genre and language
  const defaultGenres = ["Fiction", "Non-Fiction", "Mystery", "Fantasy", "Biography"];
  const defaultLanguages = ["English", "Spanish", "German", "French", "Japanese"];

  
  genres.push(...defaultGenres);
  languages.push(...defaultLanguages);

  
  const uniqueGenres = Array.from(new Set(genres));
  const uniqueLangs = Array.from(new Set(languages));

 
  genres.length = 0;
  languages.length = 0;
  uniqueGenres.forEach((item) => genres.push(item));
  uniqueLangs.forEach((item) => languages.push(item));


  const sortedProducts = () => {
    let filtered = [...products];

    if (selectedGenre !== "All") {
      filtered = filtered.filter((p) => p.genre === selectedGenre);
    }
    if (selectedLanguage !== "All") {
      filtered = filtered.filter((p) => p.language === selectedLanguage);
    }
    if (minRating > 0) {
      filtered = filtered.filter((p) => p.rating >= minRating);
    }
    if (inStockOnly) {
      filtered = filtered.filter((p) => p.stock > 0);
    }

    // search filter for title or author
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // filter by price range
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    if (sortOption === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortOption === "pages-low") {
      filtered.sort((a, b) => (a.pages ?? 0) - (b.pages ?? 0));
    } else if (sortOption === "pages-high") {
      filtered.sort((a, b) => (b.pages ?? 0) - (a.pages ?? 0));
    } else if (sortOption === "newest") {
      filtered.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortOption === "oldest") {
      filtered.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sortOption === "popularity") {
      filtered.sort((a, b) => (b.ordered_count ?? 0) - (a.ordered_count ?? 0));
    }

    return filtered;
  };

  const formatUrl = (title: string, author: string) => {
    return `/products/${title.toLowerCase().replace(/\s+/g, "-")}-${author
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

        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 2,
            background: "#ffffff",
            mb: 4,
            border: "1px solid #ddd"
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, textAlign: "center", fontWeight: "bold" }}>
            Filter Options
          </Typography>
          {/* Filters */}
          <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
            {/* Genre Filter */}
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel id="genre-label">Filter by Genre</InputLabel>
              <Select
                labelId="genre-label"
                value={selectedGenre}
                label="Filter by Genre"
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                {genres.map((genre) => (
                  <MenuItem key={genre} value={genre}>
                    {genre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Language Filter */}
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel id="language-label">Filter by Language</InputLabel>
              <Select
                labelId="language-label"
                value={selectedLanguage}
                label="Filter by Language"
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {languages.map((lang) => (
                  <MenuItem key={lang} value={lang}>
                    {lang}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Rating Filter */}
            <Box sx={{ width: 200 }}>
              <Typography gutterBottom>Min Rating: {minRating}</Typography>
              <Slider
                value={minRating}
                onChange={(e, newValue) => setMinRating(newValue as number)}
                step={0.5}
                marks
                min={0}
                max={5}
                valueLabelDisplay="auto"
              />
            </Box>

            {/* In Stock Filter */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
              }
              label="In Stock Only"
            />

            {/* Sort Dropdown */}
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel id="sort-label">Sort By</InputLabel>
              <Select
                labelId="sort-label"
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

            {/* Title/Author Search */}
            <TextField
              label="Search Title/Author"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 220 }}
            />

            {/* Price Range Filter */}
            <Box sx={{ width: 200 }}>
              <Typography gutterBottom>
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </Typography>
              <Slider
                value={priceRange}
                onChange={(e, newValue) => setPriceRange(newValue as [number, number])}
                valueLabelDisplay="auto"
                min={0}
                max={500}
                step={10}
              />
            </Box>
          </Stack>
        </Paper>

        {/* Product Cards */}
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
              
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ProductPage;