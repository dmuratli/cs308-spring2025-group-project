import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
} from '@mui/material';
import axios from 'axios';

interface OrderItemInfo {
  product_id: number;
  product_slug: string;
  product_title: string;
  quantity: number;
}

const RateReviewPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [items, setItems] = useState<OrderItemInfo[]>([]);
  const [selected, setSelected] = useState<OrderItemInfo | null>(null);
  const [stars, setStars] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get<{ items: OrderItemInfo[] }>(
          `http://localhost:8000/api/orders/product-info/${orderId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setItems(res.data.items);
        // default to first
        if (res.data.items.length > 0) {
          setSelected(res.data.items[0]);
        }
      } catch (err) {
        console.error('Failed to load order items', err);
        setError('Could not load the products associated with this order.');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [orderId]);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        'http://localhost:8000/api/reviews/create/',
        {
          product: selected.product_id,
          stars,
          review_text: comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      navigate(`/products/${selected.product_slug}`);
    } catch (err) {
      console.error('Review error', err);
      setError('Review could not be submitted');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 6,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to right, #fdfbfb, #ebedee)',
        py: 6,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          borderRadius: 4,
          width: '100%',
          textAlign: 'center',
          transition: 'transform 0.3s ease',
          '&:hover': { transform: 'scale(1.02)' },
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          ⭐ Rate & Review
        </Typography>

        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Order ID: <strong>#{orderId}</strong>
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Select Product */}
        <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
          <InputLabel id="product-select-label">Which book?</InputLabel>

          <Select
            labelId="product-select-label"
            id="product-select"
            value={selected?.product_id ?? ''}
            label="Which book?"
            input={<OutlinedInput label="Which book?" />}
            displayEmpty
            onChange={(e) => {
              const pid = Number(e.target.value);
              const found = items.find((it) => it.product_id === pid) || null;
              setSelected(found);
            }}

            sx={{
              backgroundColor: '#fff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ccc',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#f6ad55',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#f6ad55',
              },
            }}

            MenuProps={{
              PaperProps: {
                sx: {
                  '& .MuiMenuItem-root.Mui-selected': {
                    backgroundColor: 'rgba(246,173,85,0.3) !important',
                  },
                  '& .MuiMenuItem-root:hover': {
                    backgroundColor: 'rgba(246,173,85,0.3) !important',
                  },
                },
              },
            }}
          >
            {/*
              Always renders the menu (even if items.length === 1), 
              because displayEmpty + one <MenuItem> is enough.
            */}
            {items.map((it) => (
              <MenuItem key={it.product_id} value={it.product_id}>
                {it.product_title} ×{it.quantity}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Rating */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Your Rating
          </Typography>
          <Rating
            name="rating"
            value={stars}
            onChange={(_, v) => v !== null && setStars(v)}
            size="large"
          />
        </Box>

        {/* Comment */}
        <TextField
          label="Your Comment"
          placeholder="Share your thoughts about the book..."
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{
            mb: 4,
            backgroundColor: '#fff',
            borderRadius: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#ccc' },
              '&:hover fieldset': { borderColor: '#f6ad55' },
              '&.Mui-focused fieldset': { borderColor: '#f6ad55' },
            },
          }}
        />

        {/* Submit */}
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={submitting || !selected}
          fullWidth
          sx={{
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '1rem',
            py: 1.5,
            background: 'linear-gradient(to right, #f6ad55, #fbd38d)',
            color: 'white',
            borderRadius: 3,
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(to right, #f9a826, #f6ad55)',
              transform: 'scale(1.05)',
            },
          }}
        >
          {submitting ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : (
            'Submit Review'
          )}
        </Button>
      </Paper>
    </Container>
  );
};

export default RateReviewPage;