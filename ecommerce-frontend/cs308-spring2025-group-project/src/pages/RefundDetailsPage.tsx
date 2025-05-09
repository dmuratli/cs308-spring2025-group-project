import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Navbar from "../components/Navbar";

interface Refund {
  id: number;
  product_title: string;
  quantity: number;
  refund_amount: number;
  created_at: string;
}

const RefundDetailsPage: React.FC = () => {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Mock verileri doğrudan set et
    const mockRefunds = [
      {
        id: 1,
        product_title: "Book A",
        quantity: 2,
        refund_amount: 40.0,
        created_at: "2025-05-01T10:00:00Z",
      },
      {
        id: 2,
        product_title: "Book B",
        quantity: 1,
        refund_amount: 20.0,
        created_at: "2025-05-02T11:00:00Z",
      },
      {
        id: 3,
        product_title: "Book C",
        quantity: 3,
        refund_amount: 60.0,
        created_at: "2025-05-03T12:00:00Z",
      },
    ];

    setRefunds(mockRefunds);
    setLoading(false);
  }, []);

  const totalRefund = refunds.reduce((sum, r) => sum + Number(r.refund_amount), 0);
  const totalQuantity = refunds.reduce((sum, r) => sum + r.quantity, 0);
  const filteredRefunds = refunds.filter((r) =>
    r.product_title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Navbar />
      <Container maxWidth="md" sx={{ pt: 10 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{
            background: "linear-gradient(to right, #EF977F, #d46c4e)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          My Refunds
        </Typography>

        <Grid container spacing={2} mb={3}>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, borderLeft: "5px solid #4caf50", backgroundColor: "#e8f5e9" }}>
              <Typography variant="subtitle1" fontWeight="medium">
                Total Refund Amount
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                ${totalRefund.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 2, borderLeft: "5px solid #2196f3", backgroundColor: "#e3f2fd" }}>
              <Typography variant="subtitle1" fontWeight="medium">
                Total Quantity Refunded
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {totalQuantity}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <TextField
          label="Search by product title"
          variant="outlined"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {loading && (
          <Box mt={4} textAlign="center">
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && filteredRefunds.length === 0 && (
          <Typography variant="body1" sx={{ mt: 4 }}>
            No refunds match your search.
          </Typography>
        )}

        <Grid container spacing={3}>
          {filteredRefunds.map((refund) => (
            <Grid item xs={12} key={refund.id}>
              <Paper
                sx={{
                  p: 3,
                  borderLeft: "5px solid #EF977F",
                  borderRadius: 3,
                  backgroundColor: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(239, 151, 127, 0.25)",
                  },
                }}
              >
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {refund.product_title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom mt={0.5}>
                  Refunded At: {new Date(refund.created_at).toLocaleString("tr-TR")}
                </Typography>
                <Typography>
                  Quantity Refunded:{" "}
                  <Box component="span" fontWeight="bold" color="primary.main">
                    {refund.quantity}
                  </Box>
                </Typography>
                <Typography>
                  Refund Amount:{" "}
                  <Box component="span" color="success.main" fontWeight="bold">
                    ${Number(refund.refund_amount).toFixed(2)}
                  </Box>
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default RefundDetailsPage;
