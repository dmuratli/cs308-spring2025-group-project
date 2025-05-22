import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  InputAdornment,
  Snackbar,
  Alert,
  Chip,
} from "@mui/material";
import axios from "axios";

interface Product {
  slug: string;
  title: string;
  author?: string;
  genre_name?: string;
  price: number;
  discount_percent: number;
}

const SalesDiscounts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // 1) load every product
  useEffect(() => {
    axios
      .get<Product[]>("/api/products/")
      .then((res) =>
        setProducts(
          res.data.map((p: any) => ({
            ...p,
            price: parseFloat(p.price),
            discount_percent: parseFloat(p.discount_percent),
          }))
        )
      )
      .catch(() =>
        setNotification({
          open: true,
          message: "Failed to load products.",
          severity: "error",
        })
      );
  }, []);

  // track input per-product
  const handleDiscountChange = (slug: string, value: string) => {
    setDiscounts((prev) => ({ ...prev, [slug]: value }));
  };

  // call your POST /set_discount/
  const handleDiscount = async (slug: string) => {
    try {
      const amt = discounts[slug] || "0";
      await axios.post(`/api/products/${slug}/set_discount/`, {
        discount: amt,
      });
      // reflect it in-place
      setProducts((prev) =>
        prev.map((p) =>
          p.slug === slug ? { ...p, discount_percent: parseFloat(amt) } : p
        )
      );
      setNotification({
        open: true,
        message: `Set ${amt}% off on "${slug}"`,
        severity: "success",
      });
    } catch {
      setNotification({
        open: true,
        message: "Failed to apply discount.",
        severity: "error",
      });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 12, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Set Discount Campaigns
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Choose products and discount rates to update sale prices.
      </Typography>

      {products.length === 0 ? (
        <Box mt={6} textAlign="center">
          <Typography>No products available.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map((p) => {
            const discountedPrice = (
              p.price *
              (1 - p.discount_percent / 100)
            ).toFixed(2);
            return (
              <Grid item xs={12} key={p.slug}>
                <Card elevation={2}>
                  <CardContent>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs>
                        <Typography variant="h6">{p.title}</Typography>
                        {p.author && (
                          <Typography variant="body2" color="textSecondary">
                            {p.author}
                          </Typography>
                        )}
                        {p.genre_name && (
                          <Box mt={1}>
                            <Chip label={p.genre_name} size="small" />
                          </Box>
                        )}
                        {p.discount_percent > 0 && (
                          <Box mt={1}>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              sx={{ textDecoration: "line-through" }}
                            >
                              ${p.price.toFixed(2)}
                            </Typography>
                            <Typography variant="h6" color="primary">
                              ${discountedPrice}
                            </Typography>
                          </Box>
                        )}
                      </Grid>

                      <Grid item>
                        <TextField
                          label="Discount %"
                          type="number"
                          size="small"
                          variant="outlined"
                          value={discounts[p.slug] || ""}
                          onChange={(e) =>
                            handleDiscountChange(p.slug, e.target.value)
                          }
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">%</InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item>
                          <Button
                            variant="contained"
                            onClick={() => handleDiscount(p.slug)}
                            sx={{
                              backgroundColor: "#FFA559",
                              color: "#fff",
                              "&:hover": { backgroundColor: "#e68e3f" },
                            }}
                          >
                            Set Discount
                          </Button>
                        </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={() => setNotification((n) => ({ ...n, open: false }))}
      >
        <Alert
          onClose={() => setNotification((n) => ({ ...n, open: false }))}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SalesDiscounts;