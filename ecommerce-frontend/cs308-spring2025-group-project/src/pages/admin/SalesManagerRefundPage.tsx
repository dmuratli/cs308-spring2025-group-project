import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Container,
  CircularProgress,
  Grid,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import Navbar from "../../components/Navbar";

interface RefundRequest {
  id: number;
  user: string;
  order_item: number;
  quantity: number;
  status: string;
  requested_at: string;
  processed_at: string | null;
  response_message: string;
  order_item_details: {
    product_title: string;
    price_at_purchase: number;
  };
}

const SalesManagerRefundPage: React.FC = () => {
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const fetchRequests = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch("http://localhost:8000/api/orders/refund-requests/pending/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to fetch refund requests", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const processRequest = async (id: number, status: "Approved" | "Rejected") => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`http://localhost:8000/api/orders/refund-requests/${id}/process/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, response_message: "" }),
      });

      if (!res.ok) throw new Error("Failed to process request");

      setSnackbar({ open: true, message: `Request ${status}`, severity: "success" });
      fetchRequests(); // refresh list
    } catch (err) {
      setSnackbar({ open: true, message: "Error processing request", severity: "error" });
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <Box sx={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Navbar />
      <Container sx={{ pt: 10 }}>
        <Typography variant="h4" gutterBottom>
          Pending Refund Requests
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : requests.length === 0 ? (
          <Typography>No pending refund requests.</Typography>
        ) : (
          <Grid container spacing={3}>
            {requests.map((r) => (
              <Grid item xs={12} key={r.id}>
                <Paper sx={{ p: 3, borderLeft: "5px solid #f57c00" }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {r.order_item_details?.product_title || "Unknown Product"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quantity: {r.quantity} | Requested At: {new Date(r.requested_at).toLocaleString("tr-TR")}
                  </Typography>
                  <Box mt={2} display="flex" gap={2}>
                    <Button
                      variant="outlined"
                      color="success"
                      onClick={() => processRequest(r.id, "Approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => processRequest(r.id, "Rejected")}
                    >
                      Reject
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SalesManagerRefundPage;
