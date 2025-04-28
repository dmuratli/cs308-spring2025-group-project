// src/components/Navbar.tsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  InputBase,
  Badge,
  Menu,
  MenuItem,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import axios from "axios";
// motion için
import { motion } from "framer-motion";

// ← Logoyu import ediyoruz
import logo from "../assets/Axo1.png";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [openDropdown, setOpenDropdown] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setOpenDropdown(false);
      return;
    }
    try {
      const { data } = await axios.get(
        `http://127.0.0.1:8000/api/products/?search=${searchQuery}`
      );
      setSearchResults(data);
      setOpenDropdown(true);
    } catch (e) {
      console.error("Search Error:", e);
      setSearchResults([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch(query);
  };

  const handleResultClick = (p: any) => {
    const slug = p.title.toLowerCase().replace(/\s+/g, "-");
    const authorSlug = p.author.toLowerCase().replace(/\s+/g, "-");
    navigate(`/products/${slug}-${authorSlug}`);
    setOpenDropdown(false);
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: "white", boxShadow: 3 }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/** ← MOTION WRAPPER: logo+text */}
        <Box
          component={motion.div}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={() => navigate("/")}
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            gap: theme.spacing(1.5),
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="AxoReads"
            sx={{
              height: 70,
              pointerEvents: "none", // tüm tıklamalar motion.container'a gelsin
            }}
          />
          <Typography
            variant="h5"
            sx={{
              // gradient text
              background: "linear-gradient(90deg, #ffd27d 0%, #ffaf64 50%, #ffa057 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              // font stili
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              letterSpacing: "0.08em",
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              pointerEvents: "none",
            }}
          >
            AxoReads
          </Typography>
        </Box>

        {/** ← ARAMA ÇUBUĞU **/}
        <Box sx={{ position: "relative", width: { xs: "70%", md: "45%" } }}>
          <Paper
            sx={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #ccc",
              borderRadius: 1,
              px: 2,
              boxShadow: 1,
            }}
          >
            <InputBase
              placeholder="Search for books..."
              sx={{ flex: 1, py: 0.5, fontSize: "0.95rem" }}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              onKeyDown={handleKeyDown}
            />
            <IconButton onClick={() => handleSearch(query)}>
              <SearchIcon />
            </IconButton>
          </Paper>
          {openDropdown && (
            <Paper
              sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                width: "100%",
                maxHeight: 240,
                overflowY: "auto",
                boxShadow: 3,
                zIndex: 10,
              }}
            >
              {searchResults.length > 0 ? (
                searchResults.map((p) => (
                  <MenuItem key={p.id} onClick={() => handleResultClick(p)}>
                    {p.title} – {p.author}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No results</MenuItem>
              )}
            </Paper>
          )}
        </Box>

        {/** ← OTURUM VE SEPET BÖLÜMÜ **/}
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
                  "&:hover": { backgroundColor: "#d46c4e" },
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
                  "&:hover": { backgroundColor: "#EF977F", color: "white" },
                }}
              >
                Login
              </Button>
            </>
          ) : (
            <>
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ ml: 1 }}
              >
                <AccountCircleIcon sx={{ fontSize: 30, color: "#EF977F" }} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem onClick={() => navigate("/profile")}>
                  Profile
                </MenuItem>
                <MenuItem onClick={logout}>Logout</MenuItem>
              </Menu>
            </>
          )}
          <IconButton onClick={() => navigate("/cart")} sx={{ ml: 1 }}>
            <Badge badgeContent={itemCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
