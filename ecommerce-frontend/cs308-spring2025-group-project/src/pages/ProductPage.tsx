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
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AddToCartButton from "../components/AddToCartButton";
import axios from "axios";
import { useWishlist } from "../context/WishlistContext";

interface Product {
  id: number;
  title: string;
  author: string;
  genre: number;        // FK id
  genre_name: string;   // human-readable name
  language: string;
  description: string;
  price: number;
  discount_percent: number;
  stock: number;
  cover_image?: string;
  rating: number;
  canRate: boolean;
  pages: number;
  created_at: string;
  ordered_number: number;
}

interface Genre {
  id: number;
  name: string;
}

const ProductPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [sortOption, setSortOption] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 0]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  const navigate = useNavigate();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  useEffect(() => {
    // fetch products
    axios
      .get("/api/products/?ordering=-ordered_number")
      .then((res) => {
        const list = (res.data as any[]).map((p) => ({
          ...p,
          price: parseFloat(p.price),
          discount_percent: parseFloat(p.discount_percent),
        })) as Product[];
        setProducts(list);
        if (list.length) {
          const prices = list.map((p) => p.price);
          const minP = Math.min(...prices, 0);
          const maxP = Math.max(...prices, 0);
          setPriceBounds([minP, maxP]);
          setPriceRange([minP, maxP]);
        }
      })
      .catch((err) => console.error("Error fetching products:", err));

    // fetch genres
    axios
      .get("/api/genres/")
      .then((res) => setGenres(res.data))
      .catch((err) => console.error("Error fetching genres:", err));
  }, []);

  const handleRatingChange = (index: number, newValue: number | null) => {
    if (newValue === null) return;
    setProducts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], rating: newValue };
      return copy;
    });
  };

  const uniqueGenres = ["All", ...genres.map((g) => g.name)];
  const languages = Array.from(new Set(["All", ...products.map((p) => p.language)]));
  const defaultLanguages = ["English", "Spanish", "German", "French", "Japanese"];
  const uniqueLanguages = Array.from(new Set([...languages, ...defaultLanguages]));

  const sortedProducts = () => {
    let filtered = [...products];

    if (selectedGenre !== "All") {
      filtered = filtered.filter((p) => p.genre_name === selectedGenre);
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
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.author.toLowerCase().includes(term)
      );
    }

    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortOption) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "pages-low":
        filtered.sort((a, b) => a.pages - b.pages);
        break;
      case "pages-high":
        filtered.sort((a, b) => b.pages - a.pages);
        break;
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "popularity":
        filtered.sort((a, b) => b.ordered_number - a.ordered_number);
        break;
    }

    return filtered;
  };

  const formatUrl = (title: string, author: string) =>
    `/products/${title.toLowerCase().replace(/\s+/g, "-")}-${author
      .toLowerCase()
      .replace(/\s+/g, "-")}`;

  return (
    <Box>
      <Navbar />
      <Container maxWidth="lg" sx={{ my: 10, px: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={5}>
          Our Book Collection
        </Typography>

        <Paper
          elevation={3}
          sx={{ p: 3, borderRadius: 2, mb: 4, border: "1px solid #ddd" }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, textAlign: "center", fontWeight: "bold" }}
          >
            Filter Options
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel id="genre-label">Genre</InputLabel>
              <Select
                labelId="genre-label"
                value={selectedGenre}
                label="Genre"
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                {uniqueGenres.map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel id="language-label">Language</InputLabel>
              <Select
                labelId="language-label"
                value={selectedLanguage}
                label="Language"
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {uniqueLanguages.map((l) => (
                  <MenuItem key={l} value={l}>
                    {l}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ width: 200 }}>
              <Typography gutterBottom>Min Rating: {minRating}</Typography>
              <Slider
                value={minRating}
                onChange={(_, v) => setMinRating(v as number)}
                step={0.5}
                marks
                min={0}
                max={5}
                valueLabelDisplay="auto"
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
              }
              label="In Stock Only"
            />

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

            <TextField
              label="Search Title/Author"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 220 }}
            />

            <Box sx={{ width: 240 }}>
              <Typography gutterBottom>
                Price: ${priceRange[0]} – ${priceRange[1]}
              </Typography>
              <Slider
                value={priceRange}
                onChange={(_, v) => setPriceRange(v as [number, number])}
                valueLabelDisplay="auto"
                min={priceBounds[0]}
                max={priceBounds[1]}
                step={1}
              />
            </Box>
          </Stack>
        </Paper>

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
  {sortedProducts().map((product, idx) => {
    const inWishlist = isInWishlist(product.id);
    return (
      <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
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
              {product.genre_name} | {product.language}
            </Typography>
            {product.canRate ? (
              <Rating
                name={`rating-${idx}`}
                value={product.rating}
                onChange={(_, v) => handleRatingChange(idx, v)}
              />
            ) : (
              <Rating name={`rating-${idx}`} value={product.rating} readOnly />
            )}
            {product.discount_percent > 0 ? (
              <Box mt={2}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ textDecoration: "line-through" }}
                >
                  ${product.price.toFixed(2)}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${(product.price * (1 - product.discount_percent / 100)).toFixed(2)}
                </Typography>
              </Box>
            ) : (
              <Typography variant="h6" color="primary" mt={2}>
                ${product.price}
              </Typography>
            )}
            <AddToCartButton
              productId={product.id}
              fullWidth
              disabled={product.stock === 0}
              buttonText={product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            />
          </CardContent>
          <CardActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              size="small"
              variant={inWishlist ? "contained" : "outlined"}
              color="secondary"
              startIcon={inWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              onClick={(e) => {
                e.stopPropagation();
                if (inWishlist) removeFromWishlist(product.id);
                else addToWishlist(product.id);
              }}
            >
              {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  })}
</Grid>

      </Container>
    </Box>
  );
};

export default ProductPage;