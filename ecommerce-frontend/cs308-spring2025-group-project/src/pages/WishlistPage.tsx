// src/pages/WishlistPage.tsx
import React, { useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button,
  CircularProgress,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import AddToCartButton from '../components/AddToCartButton';
import AddToWishlistButton from '../components/AddToWishlistButton';
const API_BASE_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:8000';

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

const WishlistPage: React.FC = () => {
  const { wishlist, loading, fetchWishlist } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleProductClick = (slug: string) => {
    navigate(`/products/${slug}`);
  };

  return (
    <Box>
      <Container maxWidth="lg" sx={{ mt: 12, mb: 5 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={2}>
          My Wishlist
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          mb={5}
        >
          Books you've marked as interesting for future reading
        </Typography>
        <Divider sx={{ mb: 4 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        ) : !wishlist || !wishlist.items || wishlist.items.length === 0 ? (
          <Box textAlign="center" my={10}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Your wishlist is currently empty.
            </Typography>
            <Button 
              component={motion.button}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              variant="contained" 
              onClick={() => navigate('/')}
              sx={{
                mt: 3,
                background: "linear-gradient(90deg,#f9a826 0%,#ef977f 100%)",
                color: "white",
                px: 4,
                py: 1.3,
                fontSize: "1.05rem",
                borderRadius: 3,
                boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
              }}
            >
              Start Shopping
            </Button>
          </Box>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            {wishlist.items.map((item, idx) => {
              const p = item.product;
              if (!p) return null;

              return (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <motion.div
                    custom={idx}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={fadeIn}
                  >
                    <Card
                      component={motion.div}
                      whileHover={{ scale: 1.03 }}
                      sx={{ 
                        boxShadow: 4, 
                        borderRadius: 3,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                      }}
                    >
                      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                        <AddToWishlistButton productId={item.product?.id!} />
                      </Box>

                      <CardMedia
                        component="img"
                        height="220"
                        image={
                          p.product_cover_image
                            ? // absolute already?
                              p.product_cover_image.startsWith('http')
                                ? p.product_cover_image
                                : `${API_BASE_URL}${p.product_cover_image}`
                            : 'https://via.placeholder.com/250x350?text=No+Image'
                        }
                        alt={p.title}
                        onClick={() => handleProductClick(item.product?.slug)}
                        sx={{ cursor: 'pointer' }}
                      />

                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography 
                          variant="h6" 
                          fontWeight="bold" 
                          noWrap
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleProductClick(item.product?.slug)}
                        >
                          {p.title}
                        </Typography>

                        <Typography variant="body1" fontWeight="bold" sx={{ my: 1 }}>
                          {p.product_price != null
                            ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                                parseFloat(String(p.product_price))
                              )
                            : "$0.00"}
                        </Typography>

                        <Box sx={{ mt: 'auto' }}>
                          <AddToCartButton
                            productId={p.id}
                            buttonText="Add to Cart"
                            fullWidth
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}

          </Grid>
        )}
      </Container>
      
      {/* Footer */}
      <Box
        sx={{
          background: "linear-gradient(90deg,#ef977f 0%,#f9a826 100%)",
          color: "white",
          textAlign: "center",
          py: 6,
          px: 2,
          mt: 8,
        }}
      >
        <Typography variant="h4" fontWeight={700} mb={1}>
          Manage Your Reading Wishlist
        </Typography>
        <Typography variant="body1">
          Keep track of books you'd like to read in the future.
        </Typography>

        <Button
          component={motion.button}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          variant="contained"
          onClick={() => navigate('/products')}
          sx={{
            mt: 3,
            background: "white",
            color: "#ef977f",
            px: 4,
            fontWeight: 600,
          }}
        >
          Browse More Books
        </Button>
      </Box>
    </Box>
  );
};

export default WishlistPage;