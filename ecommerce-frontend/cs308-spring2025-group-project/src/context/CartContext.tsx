import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

// API base URL
const API_BASE_URL = "http://localhost:8000";

// Cart item interface
export interface CartItem {
  id: number;
  product: number;
  product_title: string;
  product_price: number;
  quantity: number;
  total_price: number;
}

// Cart interface
export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
  session_key?: string;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  fetchCart: () => Promise<void>;
  updateCartItemCount: (count: number) => void;
  addToCart: (productId: number, quantity: number) => Promise<boolean>;
  updateItemQuantity: (productId: number, quantity: number) => Promise<boolean>;
  removeItem: (productId: number) => Promise<boolean>;
}

// Create the context with default values
const CartContext = createContext<CartContextType>({
  cart: null,
  loading: false,
  itemCount: 0,
  fetchCart: async () => {},
  updateCartItemCount: () => {},
  addToCart: async () => false,
  updateItemQuantity: async () => false,
  removeItem: async () => false,
});

// Hook to use the cart context
export const useCart = () => useContext(CartContext);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [itemCount, setItemCount] = useState(0);

  // Function to fetch cart data
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/cart/`, { withCredentials: true });
      
      if (res.data && typeof res.data === 'object') {
        setCart(res.data);
        
        // Calculate total quantity across all items (not just item count)
        const totalQuantity = res.data.items?.reduce(
          (sum: number, item: CartItem) => sum + item.quantity, 
          0
        ) || 0;
        
        setItemCount(totalQuantity);
      } else {
        console.error("Unexpected API response:", res.data);
      }
    } catch (err) {
      console.error("Error loading cart:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to update cart item count
  const updateCartItemCount = (count: number) => {
    setItemCount(count);
  };

  // Function to add item to cart
  const addToCart = async (productId: number, quantity: number): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/cart/`,
        { 
          product_id: productId,
          quantity: quantity 
        },
        { withCredentials: true }
      );
      
      if (response.data) {
        // Update cart data
        setCart(response.data);
        
        // Calculate total quantity
        const totalQuantity = response.data.items?.reduce(
          (sum: number, item: CartItem) => sum + item.quantity, 
          0
        ) || 0;
        
        setItemCount(totalQuantity);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Function to update item quantity
  const updateItemQuantity = async (productId: number, quantity: number): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/cart/`,
        { 
          product_id: productId,
          quantity: quantity 
        },
        { withCredentials: true }
      );
      
      if (response.data) {
        setCart(response.data);
        
        // Calculate total quantity
        const totalQuantity = response.data.items?.reduce(
          (sum: number, item: CartItem) => sum + item.quantity, 
          0
        ) || 0;
        
        setItemCount(totalQuantity);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Function to remove item from cart
  const removeItem = async (productId: number): Promise<boolean> => {
    try {
      setLoading(true);
      // Your backend uses quantity=0 to remove items
      const response = await axios.post(
        `${API_BASE_URL}/cart/`,
        { 
          product_id: productId,
          quantity: 0 
        },
        { withCredentials: true }
      );
      
      if (response.data) {
        setCart(response.data);
        
        // Calculate total quantity
        const totalQuantity = response.data.items?.reduce(
          (sum: number, item: CartItem) => sum + item.quantity, 
          0
        ) || 0;
        
        setItemCount(totalQuantity);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart data on initial mount
  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        fetchCart,
        updateCartItemCount,
        addToCart,
        updateItemQuantity,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;