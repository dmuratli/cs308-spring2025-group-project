import React from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container sx={{ mt: 12 }}>
      <Typography variant="h4" fontWeight="bold" color="#EF977F" gutterBottom>
        Admin Dashboard
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        <Button variant="contained" onClick={() => navigate("/admin/products")}>
          Manage Products
        </Button>
        <Button variant="contained" onClick={() => navigate("/admin/orders")}>
          Manage Orders
        </Button>
        <Button variant="contained" onClick={() => navigate("/admin/users")}>
          Manage Users
        </Button>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
