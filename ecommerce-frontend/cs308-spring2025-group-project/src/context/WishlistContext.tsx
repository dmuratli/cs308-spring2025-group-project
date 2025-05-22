// src/context/WishlistContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../axios";
import { useAuth } from "./AuthContext";

// Ürün tipi
export interface WishlistItem {
  id: number;
  product: {
    id: number;
    title: string;
    slug: string;
    product_price: number;
    product_cover_image: string;
    discount_percent: number;
    discounted_price: string;
  };
}

// Wishlist interface
export interface Wishlist {
  id: number;
  items: WishlistItem[];
}

interface WishlistContextType {
  wishlist: Wishlist | null;
  loading: boolean;
  itemCount: number;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: number) => Promise<boolean>;
  removeFromWishlist: (productId: number) => Promise<boolean>;
  isInWishlist: (productId: number) => boolean;
}

// Context oluştur
const WishlistContext = createContext<WishlistContextType>({
  wishlist: null,
  loading: false,
  itemCount: 0,
  fetchWishlist: async () => {},
  addToWishlist: async () => false,
  removeFromWishlist: async () => false,
  isInWishlist: () => false,
});

// Hook to use the wishlist context
export const useWishlist = () => useContext(WishlistContext);

interface WishlistProviderProps {
  children: React.ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const { isAuthenticated } = useAuth();

  // İstek listesini getir
  const fetchWishlist = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const res = await api.get("/wishlist/");
      
      if (res.data && typeof res.data === 'object') {
        setWishlist(res.data);
        // Toplam ürün sayısını hesapla
        const totalItems = res.data.items?.length || 0;
        setItemCount(totalItems);
      } else {
        console.error("Unexpected API response:", res.data);
      }
    } catch (err) {
      console.error("Error loading wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  // İstek listesine ürün ekle
  const addToWishlist = async (productId: number): Promise<boolean> => {
    if (!isAuthenticated) {
      alert("Please login to add a product to the wishlist.");
      return false;
    }
    
    try {
      setLoading(true);
      const response = await api.post("/wishlist/add/", { product_id: productId });
      
      if (response.data) {
        // İstek listesini güncelle
        setWishlist(response.data);
        
        // Toplam ürün sayısını güncelle
        const totalItems = response.data.items?.length || 0;
        setItemCount(totalItems);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding item to wishlist:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // İstek listesinden ürün çıkar
  const removeFromWishlist = async (productId: number): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
      setLoading(true);
      const response = await api.post("/wishlist/remove/", { product_id: productId });
      
      if (response.data) {
        setWishlist(response.data);
        
        // Toplam ürün sayısını güncelle
        const totalItems = response.data.items?.length || 0;
        setItemCount(totalItems);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Ürünün istek listesinde olup olmadığını kontrol et
  const isInWishlist = (productId: number): boolean =>
  !!wishlist?.items?.some((it) => it.product?.id === productId);

  // Kullanıcı kimlik doğrulaması değiştiğinde istek listesini yeniden getir
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlist(null);
      setItemCount(0);
    }
  }, [isAuthenticated]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        itemCount,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;