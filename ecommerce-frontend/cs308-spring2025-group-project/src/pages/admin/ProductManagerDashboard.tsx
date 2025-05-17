import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Stack,
  Container,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import axios from "axios";

interface ActionCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

const MotionPaper = motion(Paper);

const ActionCard: React.FC<ActionCardProps> = ({ title, description, onClick }) => (
  <MotionPaper
    elevation={4}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.03, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
    transition={{ duration: 0.4, ease: "easeOut", type: "spring" }}
    sx={{
      p: 4,
      borderRadius: 4,
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
        OPEN
      </Button>
    </Box>
  </MotionPaper>
);

const btnStyle = {
  borderColor: "#FFA559",
  color: "#FFA559",
  fontWeight: "bold",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: "#e68e3f",
    backgroundColor: "#FFF0E6",
    color: "#e68e3f",
  },
};

const ProductManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  if (loading) {
    return (
      <Box sx={{ backgroundColor: "#FFF5EC", minHeight: "100vh" }}>
        <Navbar />
        <Typography align="center" sx={{ mt: 6 }}>
          Loading…
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#FFF5EC", minHeight: "100vh" }}>
      <Navbar />

      {/* Header: Responsive paddingTop ile her zaman aşağıda ve ortada */}
      <Box
        sx={{
          pt: { xs: 10, sm: 14, md: 16 }, // Navbar'ın altında bolca boşluk bırakır
          pb: { xs: 4, sm: 6 },
          textAlign: "center",
          backgroundColor: "#FFA559",
          color: "white",
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          mb: 6,
        }}
      >
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
          Product Manager Dashboard
        </Typography>
        <Typography variant="subtitle1" mt={1}>
          Manage your stock, orders, comments, and deliveries at a glance.
        </Typography>
      </Box>

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack spacing={4}>
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
          <ActionCard
            title="Manage Genres"
            description="Add or remove book genres."
            onClick={() => navigate("/product-manager/genres")}
          />
        </Stack>
      </Container>
    </Box>
  );
};

export default ProductManagerDashboard;
