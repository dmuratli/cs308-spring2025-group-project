import React from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Container,
  Toolbar,
  Button,
} from "@mui/material";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";

const SalesManagerDashboard = () => {
  return (
    <Box sx={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Navbar />
      <Toolbar />

      {/* Header */}
      <Box
        sx={{
          py: 6,
          textAlign: "center",
          backgroundColor: "#EF977F", // Pembe tema
          color: "white",
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Sales Manager Dashboard
        </Typography>
        <Typography variant="subtitle1" mt={1}>
          Manage product pricing, discounts, refunds, and revenue reports.
        </Typography>
      </Box>

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack spacing={3}>
          <ActionCard
            title="Set Prices for New Products"
            description="Define prices for products added by product managers."
          />
          <ActionCard
            title="Set Discount Campaigns"
            description="Choose products and discount rates to update sale prices."
          />
          <ActionCard
            title="View & Export Invoices"
            description="Filter invoices by date range, print or save as PDF."
          />
          <ActionCard
            title="Revenue & Profit Reports"
            description="View charts and summaries of revenue and profit/loss."
          />
          <ActionCard
            title="Manage Refund Requests"
            description="Review customer refund requests and restock returned items."
          />
        </Stack>
      </Container>
    </Box>
  );
};

interface ActionCardProps {
  title: string;
  description: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if(title.includes("Invoices")) navigate("/sales-manager/invoices")
    else if (title.includes("Refund")) navigate("/sales-manager/refunds");
    //if (title.includes("Prices")) navigate("");
    //else if (title.includes("Discount")) navigate("");
    //else if (title.includes("Invoices")) navigate("/sales-manager/invoices");
    //else if (title.includes("Revenue")) navigate("");
    //else if (title.includes("Refund")) navigate("");
  };

  return (
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
        <Button variant="outlined" sx={btnStyle} onClick={handleClick}>
          Open
        </Button>
      </Box>
    </Paper>
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

export default SalesManagerDashboard;
