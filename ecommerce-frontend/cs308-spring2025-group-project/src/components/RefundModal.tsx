import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";

interface RefundItem {
  id: number;
  product_title: string;
  refundable_quantity: number;
  quantity: number;
}

interface RefundModalProps {
  open: boolean;
  onClose: () => void;
  orderId: number;
  accessToken: string;
  onSuccess: () => void;
}

const RefundModal: React.FC<RefundModalProps> = ({
  open,
  onClose,
  orderId,
  accessToken,
  onSuccess,
}) => {
  const [items, setItems] = useState<RefundItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;

    fetch(`http://localhost:8000/api/orders/${orderId}/items/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const withQty = data
          .filter((item: any) => item.refundable_quantity > 0) // ⛔ sıfır iade edilebilir ürünleri gösterme
          .map((item: any) => ({
            id: item.id,
            product_title: item.product_title,
            refundable_quantity: item.refundable_quantity,
            quantity: 0,
          }));
        setItems(withQty);
      });
  }, [open, orderId, accessToken]);

  const handleSelectChange = (id: number, event: SelectChangeEvent<number>) => {
    const value = Number(event.target.value);
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: value } : i))
    );
  };

  const handleSubmit = async () => {
    const payloads = items
      .filter((i) => i.quantity > 0)
      .map((i) => ({
        order_item_id: i.id,
        quantity: i.quantity,
      }));
  
    if (payloads.length === 0) {
      alert("Please select at least one quantity to refund.");
      return;
    }
  
    setLoading(true);
  
    try {
      for (const data of payloads) {
        const res = await fetch(
          `http://localhost:8000/api/orders/${orderId}/refund-requests/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(data),
          }
        );
  
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Refund request failed");
        }
      }
  
      setShowSuccess(true);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Refund Request for Order #{orderId}</DialogTitle>
        <DialogContent dividers>
          {items.length === 0 && (
            <Typography variant="body2" color="textSecondary">
              No refundable items available.
            </Typography>
          )}
          {items.map((item) => (
            <Box key={item.id} mb={2}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={7}>
                  <Typography>{item.product_title}</Typography>
                </Grid>
                <Grid item xs={5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Quantity</InputLabel>
                    <Select
                      value={item.quantity}
                      label="Quantity"
                      onChange={(e) => handleSelectChange(item.id, e)}
                    >
                      {[...Array(item.refundable_quantity)].map((_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                          {i + 1}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant="contained"
            color="primary"
          >
            Confirm Refund
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setShowSuccess(false)}
          severity="success"
        >
          Refund request submitted successfully.
        </MuiAlert>
      </Snackbar>
    </>
  );
};

export default RefundModal;
