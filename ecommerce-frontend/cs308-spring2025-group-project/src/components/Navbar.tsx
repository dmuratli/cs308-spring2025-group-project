import React, { useState } from "react";
import { AppBar, Toolbar, Button, Box, IconButton, InputBase, Badge, Menu, MenuItem, Paper } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [openDropdown, setOpenDropdown] = useState(false);

  // Her yazıldığında çağrılan search fonksiyonu
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setOpenDropdown(false);
      return;
    }

    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/products/?search=${searchQuery}`);
      setSearchResults(response.data);
      setOpenDropdown(true);
    } catch (error) {
      console.error("Search Error:", error);
      setSearchResults([]);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch(query); // Enter'a basınca da ara
    }
  };

  // Detay sayfasına yönlendirme: title ve author ile
  const handleResultClick = (product: any) => {
    const formattedTitle = product.title.toLowerCase().replace(/\s+/g, "-");
    const formattedAuthor = product.author.toLowerCase().replace(/\s+/g, "-");
    navigate(`/product/${formattedTitle}-${formattedAuthor}`);
    setOpenDropdown(false);
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: "white", boxShadow: 3 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Book Store Button */}
        <Button
          onClick={() => navigate("/")}
          sx={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "black",
            textTransform: "none",
            "&:hover": { backgroundColor: "transparent", transform: "scale(1.05)" },
          }}
        >
          Book Store
        </Button>

        {/* Search Bar */}
        <Box sx={{ position: "relative", width: { xs: "75%", md: "50%" } }}>
          <Paper
            sx={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #ccc",
              borderRadius: "8px",
              overflow: "hidden",
              px: 2,
              boxShadow: 1,
            }}
          >
            <InputBase
              placeholder="Search for books..."
              sx={{ flex: 1, px: 1, py: 1, fontSize: "1rem", "&::placeholder": { color: "#666" } }}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                handleSearch(e.target.value); // Anlık arama
              }}
              onKeyDown={handleKeyDown}
            />
            <IconButton onClick={() => handleSearch(query)}>
              <SearchIcon />
            </IconButton>
          </Paper>

          {/* Dropdown Search Results */}
          {openDropdown && (
            <Paper
              sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                width: "100%",
                maxHeight: "250px",
                overflowY: "auto",
                boxShadow: 3,
                zIndex: 10,
              }}
            >
              {searchResults.length > 0 ? (
                searchResults.map((product) => (
                  <MenuItem key={product.id} onClick={() => handleResultClick(product)}>
                    {product.title} - {product.author}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No results found</MenuItem>
              )}
            </Paper>
          )}
        </Box>

        {/* Buttons */}
        <Box display="flex" alignItems="center">
          {!isAuthenticated ? (
            <>
              <Button
                variant="contained"
                onClick={() => navigate("/register")}
                sx={{
                  backgroundColor: "#EF977F",
                  color: "white",
                  mx: 1,
                  transition: "all 0.3s",
                  "&:hover": { backgroundColor: "#d46c4e", transform: "scale(1.05)" },
                }}
              >
                Sign Up
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{
                  borderColor: "#EF977F",
                  color: "#EF977F",
                  mx: 1,
                  transition: "all 0.3s",
                  "&:hover": { backgroundColor: "#EF977F", color: "white", transform: "scale(1.05)" },
                }}
              >
                Login
              </Button>
            </>
          ) : (
            <>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1, "&:hover": { transform: "scale(1.1)" } }}>
                <AccountCircleIcon sx={{ fontSize: 30, color: "#EF977F" }} />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => navigate("/profile")}>Profile</MenuItem>
                <MenuItem onClick={logout}>Logout</MenuItem>
              </Menu>
            </>
          )}

          {/* Cart Icon */}
          <IconButton onClick={() => navigate("/cart")} sx={{ ml: 1, "&:hover": { transform: "scale(1.1)" } }}>
            <Badge badgeContent={2} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;