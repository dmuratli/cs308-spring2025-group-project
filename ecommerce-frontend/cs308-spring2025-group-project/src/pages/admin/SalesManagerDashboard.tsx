import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Container,
  Toolbar,
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useMediaQuery, useTheme } from "@mui/material";

interface ActionCardProps {
  title: string;
  description: string;
  onClick?: () => void;
}

const MotionPaper = motion(Paper);

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  onClick = () => {},
}) => (
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
  borderColor: "#EF977F",
  color: "#EF977F",
  fontWeight: "bold",
  "&:hover": {
    borderColor: "#d46c4e",
    color: "#d46c4e",
  },
};

const SalesManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ backgroundColor: "#FFF5EC", minHeight: "100vh" }}>
      <Navbar />

      {/* Header */}
      <Box
        sx={{
          pt: { xs: 10, sm: 14, md: 16 },   // same
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
          Sales Manager Dashboard
        </Typography>
        <Typography variant="subtitle1" mt={1}>
          Manage product pricing, discounts, refunds, and revenue reports.
        </Typography>
      </Box>

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack spacing={4}>
          <ActionCard
            title="Set Prices for New Products"
            description="Define prices for products added by product managers."
            onClick={() => navigate("/sales-manager/pricing")}
          />
          <ActionCard
            title="Set Discount Campaigns"
            description="Choose products and discount rates to update sale prices."
            onClick={() => navigate("/sales-manager/discounts")}
          />
          <ActionCard
            title="View & Export Invoices"
            description="Filter invoices by date range, print or save as PDF."
            onClick={() => navigate("/sales-manager/invoices")}
          />
          <ActionCard
            title="Revenue Report"
            description="View revenue, cost, and profit/loss summaries."
            onClick={() => navigate("/sales-manager/revenue")}
          />
          <ActionCard
            title="Manage Refund Requests"
            description="Review customer refund requests and restock returned items."
            onClick={() => navigate("/sales-manager/refunds")}
          />
        </Stack>
      </Container>
    </Box>
  );
};

export default SalesManagerDashboard;