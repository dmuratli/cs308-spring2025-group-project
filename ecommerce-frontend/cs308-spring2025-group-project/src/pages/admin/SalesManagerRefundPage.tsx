import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  CircularProgress,
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
      const res = await fetch(
        "http://localhost:8000/api/orders/refund-requests/pending/",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setRequests(data);
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to fetch refund requests",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const processRequest = async (id: number, status: "Approved" | "Rejected") => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(
        `http://localhost:8000/api/orders/refund-requests/${id}/process/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, response_message: "" }),
        }
      );

      if (!res.ok) throw new Error();

      setSnackbar({ open: true, message: `Request ${status}`, severity: "success" });
      fetchRequests();
    } catch {
      setSnackbar({ open: true, message: "Error processing request", severity: "error" });
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Pending Refund Requests
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={6}>
            <CircularProgress />
          </Box>
        ) : requests.length === 0 ? (
          <Box mt={6} textAlign="center">
            <Typography>No pending refund requests.</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {requests.map((r) => (
              <Grid item xs={12} key={r.id}>
                <Card elevation={2}>
                  <CardContent>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs>
                        <Typography variant="h6">
                          {r.order_item_details?.product_title || "Unknown Product"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Quantity: {r.quantity} | Requested at:{" "}
                          {new Date(r.requested_at).toLocaleString("tr-TR")}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Box display="flex" gap={1}>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => processRequest(r.id, "Approved")}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => processRequest(r.id, "Rejected")}
                          >
                            Reject
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default SalesManagerRefundPage;