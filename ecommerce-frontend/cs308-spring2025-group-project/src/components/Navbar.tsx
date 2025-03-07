import React, { useState } from "react";
import { AppBar, Toolbar, Button, Box, IconButton, InputBase, Badge, Menu, MenuItem } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import useAuth

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth(); // Use AuthContext
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #ccc",
            borderRadius: "8px",
            overflow: "hidden",
            px: 2,
            width: { xs: "75%", md: "50%" },
            boxShadow: 1,
          }}
        >
          <InputBase
            placeholder="Search for books..."
            sx={{
              flex: 1,
              px: 1,
              py: 1,
              fontSize: "1rem",
              "&::placeholder": { color: "#666" },
            }}
          />
          <IconButton type="submit">
            <SearchIcon />
          </IconButton>
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
              {/* Profile Icon */}
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
