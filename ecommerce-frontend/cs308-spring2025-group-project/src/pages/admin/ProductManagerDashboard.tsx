import React from "react";
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

const ProductManagerDashboard = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Navbar />

      {/* Navbar yüksekliğini karşılayan boşluk */}
      <Toolbar />

      {/* Sayfa Başlığı */}
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

      {/* Dikey Buton Listesi */}
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Stack spacing={3}>

          {/* Orders */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              🧾 Manage Orders
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/product-manager/orders")}
              sx={btnStyle}
            >
              Go to Orders Page
            </Button>
          </Paper>

          {/* Comments */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              💬 Comment Approvals
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/product-manager/comments")}
              sx={btnStyle}
            >
              Go to Comments Page
            </Button>
          </Paper>

          {/* Invoices */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              🧾 Manage Invoices
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/product-manager/invoices")}
              sx={btnStyle}
            >
              Go to Invoices Page
            </Button>
          </Paper>


          {/* Manage Products */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              🛠️ Manage Products
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/product-manager/manage-products")}
              sx={btnStyle}
            >
              Go to Manage Products
            </Button>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
};

const btnStyle = {
  borderColor: "#EF977F",
  color: "#EF977F",
  fontWeight: "bold",
  "&:hover": {
    borderColor: "#d46c4e",
    color: "#d46c4e",
  },
};

export default ProductManagerDashboard;
