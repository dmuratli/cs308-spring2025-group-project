// src/pages/ProductManagerDashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Container,
  Toolbar,
} from "@mui/material";
import Navbar from "../../components/Navbar";
import axios from "axios";

interface ActionCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, onClick }) => (
  <Paper
    elevation={3}
    sx={{
      p: 4,
      borderRadius: 3,
      backgroundColor: "white",
      display: "flex",
      flexDirection: "column",
      gap: 1,
    }}
  >
    <Typography variant="h6" fontWeight="bold">
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
    <Box display="flex" justifyContent="flex-end" mt={2}>
      <Button variant="outlined" sx={btnStyle} onClick={onClick}>
        Open
      </Button>
    </Box>
  </Paper>
);

const btnStyle = {
  borderColor: "#EF977F",
  color: "#EF977F",
  fontWeight: "bold",
  "&:hover": {
    borderColor: "#d46c4e",
    color: "#d46c4e",
  },
};

const ProductManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:8000/api/user-info/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setRoles(res.data.roles);
      })
      .catch(() => {
        setRoles([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 1) Show nothing or a spinner while loading
  if (loading) {
    return (
      <Box sx={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
        <Navbar />
        <Toolbar />
        <Typography align="center" sx={{ mt: 4 }}>
          Loading…
        </Typography>
      </Box>
    );
  }

  // 2) If not a product manager, show “Unauthorized”
  if (!roles.includes("product manager")) {
    return (
      <Box sx={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
        <Navbar />
        <Toolbar />
        <Container maxWidth="sm" sx={{ textAlign: "center", mt: 8 }}>
          <Typography variant="h5" color="error" gutterBottom>
            You are not allowed to view this page.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/")}
            sx={{ mt: 2 }}
          >
            Go Home
          </Button>
        </Container>
      </Box>
    );
  }

  // 3) Otherwise render the dashboard
  return (
    <Box sx={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Navbar />
      <Toolbar />

      {/* Header */}
      <Box
        sx={{
          py: 6,
          textAlign: "center",
          backgroundColor: "#EF977F",
          color: "white",
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Product Manager Dashboard
        </Typography>
        <Typography variant="subtitle1" mt={1}>
          Manage your stock, orders, comments, and deliveries at a glance.
        </Typography>
      </Box>

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack spacing={3}>
          <ActionCard
            title="Manage Orders"
            description="Track and update the status of product orders."
            onClick={() => navigate("/product-manager/orders")}
          />
          <ActionCard
            title="Comment Approvals"
            description="Review and moderate user reviews for products."
            onClick={() => navigate("/product-manager/comments")}
          />
          <ActionCard
            title="Manage Invoices"
            description="Access and manage product invoices and history."
            onClick={() => navigate("/product-manager/invoices")}
          />
          <ActionCard
            title="Manage Products"
            description="Add, edit, delete or update stock for all listed products."
            onClick={() => navigate("/product-manager/manage-products")}
          />
        </Stack>
      </Container>
    </Box>
  );
};

export default ProductManagerDashboard;
