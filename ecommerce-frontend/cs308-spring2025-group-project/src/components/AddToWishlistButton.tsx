import React, { useState } from 'react';
import {
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

interface AddToWishlistButtonProps {
  productId: number;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

const AddToWishlistButton: React.FC<AddToWishlistButtonProps> = ({
  productId,
  size = 'medium',
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    type: 'info',
  });

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const inWishlist = isInWishlist(productId);

  const handleWishlistClick = async (
    e: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setNotification({
        open: true,
        message: 'Please login to add items to your wishlist',
        type: 'info',
      });
      return;
    }
    try {
      setLoading(true);
      if (inWishlist) {
        const success = await removeFromWishlist(productId);
        setNotification({
          open: true,
          message: success
            ? 'Removed from wishlist'
            : 'Could not remove from wishlist',
          type: success ? 'success' : 'error',
        });
      } else {
        const success = await addToWishlist(productId);
        setNotification({
          open: true,
          message: success
            ? 'Added to wishlist'
            : 'Could not add to wishlist',
          type: success ? 'success' : 'error',
        });
      }
    } catch (error: any) {
      setNotification({ open: true, message: 'Wishlist error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // --------- SADECE İKON BUTON ---------
  return (
    <>
      <Tooltip title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}>
        <IconButton
          onClick={handleWishlistClick}
          disabled={disabled || loading}
          size={size}
          sx={{
            color: inWishlist ? '#ef977f' : '#c6bfb4',
            p: size === 'large' ? 1.4 : 1,
            '&:hover': {
              color: '#f6ad55',
              background: 'none',
              transform: 'scale(1.18)',
              transition: 'all 0.15s',
            },
            transition: 'all 0.15s',
          }}
        >
          {loading ? (
            <CircularProgress size={28} color="inherit" />
          ) : inWishlist ? (
            <FavoriteIcon
              sx={{
                fontSize: size === 'large' ? 38 : size === 'small' ? 22 : 28,
                transition: 'color 0.15s',
              }}
            />
          ) : (
            <FavoriteBorderIcon
              sx={{
                fontSize: size === 'large' ? 38 : size === 'small' ? 22 : 28,
                transition: 'color 0.15s',
              }}
            />
          )}
        </IconButton>
      </Tooltip>

      <Snackbar
        open={notification.open}
        autoHideDuration={2000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.type}
          sx={{ fontSize: 15 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddToWishlistButton;
