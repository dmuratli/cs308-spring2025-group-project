// src/components/AddToWishlistButton.tsx
import React, { useState } from 'react';
import { Button, CircularProgress, Snackbar, Alert, IconButton, Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { motion } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

interface AddToWishlistButtonProps {
  productId: number;
  variant?: 'text' | 'outlined' | 'contained' | 'icon';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  buttonText?: string;
  disabled?: boolean;
}

const AddToWishlistButton: React.FC<AddToWishlistButtonProps> = ({
  productId,
  variant = 'icon',
  size = 'medium',
  fullWidth = false,
  buttonText = 'İstek Listesine Ekle',
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ open: boolean; message: string; type: 'success' | 'error' | 'info'; }>({
    open: false,
    message: '',
    type: 'info'
  });

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const inWishlist = isInWishlist(productId);

  const handleWishlistClick = async (
    e: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    e.stopPropagation(); // Karttaki tıklamayı engelle
    
    if (!isAuthenticated) {
      setNotification({ 
        open: true, 
        message: 'Lütfen istek listesine eklemek için giriş yapın', 
        type: 'info' 
      });
      return;
    }
    
    try {
      setLoading(true);
      if (inWishlist) {
        // İstek listesinden çıkar
        const success = await removeFromWishlist(productId);
        if (success) {
          setNotification({ 
            open: true, 
            message: 'Ürün istek listenizden çıkarıldı', 
            type: 'success' 
          });
        } else {
          setNotification({ 
            open: true, 
            message: 'Ürün istek listenizden çıkarılamadı', 
            type: 'error' 
          });
        }
      } else {
        // İstek listesine ekle
        const success = await addToWishlist(productId);
        if (success) {
          setNotification({ 
            open: true, 
            message: 'Ürün istek listenize eklendi', 
            type: 'success' 
          });
        } else {
          setNotification({ 
            open: true, 
            message: 'Ürün istek listenize eklenemedi', 
            type: 'error' 
          });
        }
      }
    } catch (error: any) {
      console.error('Error updating wishlist:', error);
      const errorMessage = error.response?.data?.error || 'İstek listesi güncellenemedi';
      setNotification({ open: true, message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (variant === 'icon') {
    return (
      <>
        <Tooltip title={inWishlist ? "İstek Listemden Çıkar" : "İstek Listeme Ekle"}>
          <IconButton
            onClick={handleWishlistClick}
            disabled={disabled || loading}
            size={size}
            sx={{
              color: inWishlist ? '#EF977F' : 'inherit',
            }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : inWishlist ? (
                <FavoriteIcon color="error" />
              ) : (
                <FavoriteBorderIcon />
              )}
            </motion.div>
          </IconButton>
        </Tooltip>

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
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        onClick={handleWishlistClick}
        disabled={disabled || loading}
        startIcon={
          loading ? <CircularProgress size={20} color="inherit" /> : 
            inWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />
        }
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
        {inWishlist ? 'İstek Listemden Çıkar' : buttonText}
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

export default AddToWishlistButton;