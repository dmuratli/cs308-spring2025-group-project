// src/components/Navbar.tsx
import React, { useState, useEffect } from "react";
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
import { motion } from "framer-motion";
import logo from "../assets/Axo1.png";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useWishlist } from "../context/WishlistContext";
import { styled } from "@mui/material/styles";

// <───✨ EKLENDİ
const LogoMotion = motion.div;
// ────────────────────────────────

// --- STYLED ICONS --- //
const SoftIconButton = styled(IconButton)(({ theme }) => ({
  background: "#FFF6F0",
  borderRadius: "50%",
  boxShadow: "0 2px 8px rgba(255, 165, 89, 0.09)",
  marginLeft: 8,
  transition: "box-shadow 0.18s, background 0.22s",
  "&:hover": {
    background: "#FFD7BA",
    boxShadow: "0 4px 16px rgba(255, 165, 89, 0.18)",
  },
  padding: 6,
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#FFA559",
    color: "white",
    fontWeight: "bold",
    boxShadow: "0 2px 6px rgba(255, 165, 89, 0.18)",
    border: "2px solid white",
    minWidth: 20,
    height: 20,
    fontSize: "0.8rem",
  },
}));

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistItemCount } = useWishlist();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);

  const gradientBg =
    "linear-gradient(90deg, #ffd27d 0%, #ffaf64 50%, #ffa057 100%)";

  // Fetch roles once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    axios
      .get("http://127.0.0.1:8000/api/user-info/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRoles(res.data.roles.map((r: string) => r.toLowerCase())))
      .catch(() => setRoles([]));
  }, [isAuthenticated]);

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
    } catch {
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
        {/* Logo + Brand */}
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
            sx={{ height: 70, pointerEvents: "none" }}
          />

          {/* ───── ANİMASYONLU LOGO METNİ ───── */}
          <LogoMotion
            initial={{ y: 0 }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.05 }}
          >
            <Typography
              variant="h5"
              sx={{
                background: gradientBg,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 800,
                letterSpacing: "0.08em",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                pointerEvents: "none",
              }}
            >
              AxoReads
            </Typography>
          </LogoMotion>
          {/* ─────────────────────────────── */}
        </Box>

        {/* Search Bar */}
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

        {/* Auth & Cart */}
        <Box display="flex" alignItems="center">
          {!isAuthenticated ? (
            <>
              <Button
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/register")}
                sx={{
                  background: gradientBg,
                  color: "white",
                  mx: 1,
                  textTransform: "none",
                  boxShadow: 2,
                }}
              >
                SIGN UP
              </Button>
              <Button
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                sx={{
                  background: gradientBg,
                  color: "white",
                  mx: 1,
                  textTransform: "none",
                  boxShadow: 2,
                }}
              >
                LOGIN
              </Button>
            </>
          ) : (
            <>
              <SoftIconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <AccountCircleIcon sx={{ fontSize: 30, color: "#FFA559" }} />
              </SoftIconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    navigate("/profile");
                  }}
                >
                  Profile
                </MenuItem>
                {roles.includes("product manager") && (
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null);
                      navigate("/product-manager");
                    }}
                  >
                    Product Manager Dashboard
                  </MenuItem>
                )}
                {roles.includes("sales manager") && (
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null);
                      navigate("/sales-manager");
                    }}
                  >
                    Sales Manager Dashboard
                  </MenuItem>
                )}
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    logout();
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}

          <SoftIconButton onClick={() => navigate("/cart")}>
            <StyledBadge badgeContent={itemCount}>
              <ShoppingCartIcon sx={{ fontSize: 28, color: "#FFA559" }} />
            </StyledBadge>
          </SoftIconButton>
          <SoftIconButton onClick={() => navigate("/wishlist")}>
            <StyledBadge badgeContent={wishlistItemCount}>
              <FavoriteIcon sx={{ fontSize: 28, color: "#FFA559" }} />
            </StyledBadge>
          </SoftIconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
