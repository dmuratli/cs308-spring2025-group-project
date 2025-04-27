// src/pages/RateReviewPage.tsx
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
} from '@mui/material';
import axios from 'axios';

const RateReviewPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [productId, setProductId] = useState<number | null>(null);
  const [productSlug, setProductSlug] = useState<string>('');
  const [stars, setStars] = useState<number | null>(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductInfo = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get(
          `http://localhost:8000/api/orders/product-info/${orderId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProductId(res.data.product_id);
        setProductSlug(res.data.product_slug);
      } catch (err) {
        console.error('Failed to load product info', err);
        setError('Could not find the product associated with this order.');
      } finally {
        setLoading(false);
      }
    };
    fetchProductInfo();
  }, [orderId]);

  const handleSubmit = async () => {
    if (!productId || !stars) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        'http://localhost:8000/api/reviews/create/',
        {
          product: productId,
          stars: stars,
          review_text: comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      navigate(`/products/${productSlug}`);
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
          '&:hover': {
            transform: 'scale(1.02)',
          },
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

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Your Rating
          </Typography>
          <Rating
            name="rating"
            value={stars}
            onChange={(_, value) => setStars(value)}
            size="large"
          />
        </Box>

        <TextField
          label="Your Comment"
          placeholder="Share your thoughts about the product..."
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
              '& fieldset': {
                borderColor: '#ccc',
              },
              '&:hover fieldset': {
                borderColor: '#f6ad55',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#f6ad55',
              },
            },
          }}
        />

        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={submitting}
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