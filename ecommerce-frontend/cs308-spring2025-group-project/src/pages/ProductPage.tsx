import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductPage: React.FC = () => {
  interface Product {
    title: string;
    author: string;
    genre: string;
    language: string;
    price: number;
    stock: number;
    cover_image?: string;
    rating: number;
    canRate: boolean;
  }

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/products/")
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  return null; // şimdilik boş render
};

export default ProductPage;
