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

interface Book {
  slug: string;
  title: string;
  author: string;
  genre_name?: string;
}

const SalesPricing: React.FC = () => {
  const [products, setProducts] = useState<Book[]>([]);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    axios
      .get<Book[]>("/api/products/pending/")
      .then(res => setProducts(res.data))
      .catch(() =>
        setNotification({
          open: true,
          message: "Failed to load pending products.",
          severity: "error",
        })
      );
  }, []);

  const handleChange = (slug: string, value: string) => {
    setPrices(prev => ({ ...prev, [slug]: value }));
  };

  const handleSet = async (slug: string) => {
    const book = products.find(p => p.slug === slug);
    try {
      await axios.post(`/api/products/${slug}/set_price/`, {
        price: prices[slug],
      });
      setProducts(prev => prev.filter(p => p.slug !== slug));
      setNotification({
        open: true,
        message: `Price set for “${book?.title}.”`,
        severity: "success",
      });
    } catch {
      setNotification({
        open: true,
        message: "Failed to set price.",
        severity: "error",
      });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Set Prices for New Products
      </Typography>

      {products.length === 0 ? (
        <Box mt={6} textAlign="center">
          <Typography>No products pending pricing.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map(p => (
            <Grid item xs={12} key={p.slug}>
              <Card elevation={2}>
                <CardContent>
                  <Grid container alignItems="center" spacing={2}>
                    {/* Book Details */}
                    <Grid item xs>
                      <Typography variant="h6">{p.title}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {p.author}
                      </Typography>
                      {p.genre_name && (
                        <Box mt={1}>
                          <Chip label={p.genre_name} size="small" />
                        </Box>
                      )}
                    </Grid>

                    {/* Price Input */}
                    <Grid item>
                      <TextField
                        label="Price"
                        type="number"
                        size="small"
                        variant="outlined"
                        value={prices[p.slug] || ""}
                        onChange={e => handleChange(p.slug, e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    {/* Set Price Button */}
                    <Grid item>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#FFA559",
                          color: "#fff",
                          fontWeight: "regular",
                          "&:hover": {
                            backgroundColor: "#e68e3f",
                          },
                        }}
                        onClick={() => handleSet(p.slug)}>
                        Set Price
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification(n => ({ ...n, open: false }))}
      >
        <Alert
          onClose={() => setNotification(n => ({ ...n, open: false }))}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SalesPricing;