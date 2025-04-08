import React, { useState } from 'react';
import { Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import axios from 'axios';
import { useCart } from '../context/CartContext'; // Yolunuzu kontrol edin

// API base URL
const API_BASE_URL = "http://localhost:8000";

interface AddToCartButtonProps {
  productId: number;
  initialQuantity?: number;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  buttonText?: string;
  disabled?: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  initialQuantity = 1,
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
  buttonText = 'Add to Cart',
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    type: 'info'
  });
  
  const { fetchCart } = useCart();

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/cart/`,
        { 
          product_id: productId,
          quantity: initialQuantity 
        },
        { withCredentials: true }
      );

      // Update cart in context
      fetchCart();

      // Show success notification
      setNotification({
        open: true,
        message: 'Item added to cart successfully!',
        type: 'success'
      });
    } catch (error: any) {
      console.error('Error adding item to cart:', error);
      
      // Handle error message from API
      const errorMessage = error.response?.data?.error || 'Failed to add item to cart';
      setNotification({
        open: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        onClick={handleAddToCart}
        disabled={disabled || loading} // disabled prop'unu ekleyin
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
        sx={{
          backgroundColor: variant === 'contained' ? '#EF977F' : undefined,
          color: variant === 'contained' ? 'white' : '#EF977F',
          borderColor: variant !== 'contained' ? '#EF977F' : undefined,
          '&:hover': {
            backgroundColor: variant === 'contained' ? '#d46c4e' : '#EF977F',
            color: variant !== 'contained' && variant !== 'text' ? 'white' : undefined,
          },
        }}
      >
        {buttonText}
      </Button>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.type}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddToCartButton;