import React, { useEffect, useState } from "react";
import { getCookie } from "../../utils/cookies";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import DiscountModal from "./DiscountModal";

/**
 * Note: API returns price and discounted_price as strings,
 * so allow both number and string here.
 */
interface Product {
  id: number;
  slug: string;
  title: string;
  author: string;
  price: number | string;
  discounted_price?: number | string | null;
  stock: number;
}

interface ManageProductsProps {
  panel: "admin" | "manager";
}

const ManageProducts: React.FC<ManageProductsProps> = ({ panel }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [stockChanges, setStockChanges] = useState<Record<string, number>>({});

  const basePath = "/product-manager";

  const loadProducts = async () => {
    try {
      const res = await axios.get<Product[]>("/api/products/", {
        withCredentials: true,
      });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load products.");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (slug: string) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`/api/products/${slug}/`, {
        withCredentials: true,
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
      });
      setProducts(prev => prev.filter(p => p.slug !== slug));
      alert("Product deleted");
    } catch {
      alert("Delete failed");
    }
  };

  const handleStockChange = (slug: string, change: number) => {
    axios.post(
      `/api/products/${slug}/adjust_stock/`,
      { change },
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') }
      }
    ).then(res => {
      setProducts(prev => prev.map(p => p.slug === slug ? { ...p, stock: res.data.stock } : p));
      setStockChanges(prev => ({ ...prev, [slug]: 0 }));
    }).catch(err => {
      console.error(err);
      alert("Stock update failed");
    });
  };

  const handleEdit = (slug: string) => navigate(`${basePath}/edit-product/${slug}`);

  const openDiscount = (product: Product) => setModalProduct(product);

  return (
    <Container sx={{ mt: 12, minHeight: '80vh' }}>
      <Typography variant="h4" gutterBottom>
        {panel === 'admin' ? 'Admin - Manage Products' : 'Product Manager - Manage Products'}
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ mb: 2 }}
        onClick={() => navigate(`${basePath}/add-product`)}
      >
        Add Product
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Disc Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Adjust Stock</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map(p => (
              <TableRow key={p.id} hover>
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.title}</TableCell>
                <TableCell>{p.author}</TableCell>
                <TableCell>{Number(p.price).toFixed(2)}</TableCell>
                <TableCell>
                  {p.discounted_price != null
                    ? Number(p.discounted_price).toFixed(2)
                    : '--'}
                </TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <TextField
                      size="small"
                      type="number"
                      value={stockChanges[p.slug] || ''}
                      onChange={e => setStockChanges(s => ({ ...s, [p.slug]: parseInt(e.target.value) || 0 }))}
                      sx={{ width: 60 }}
                    />
                    <IconButton onClick={() => handleStockChange(p.slug, stockChanges[p.slug] || 0)}><AddIcon /></IconButton>
                    <IconButton onClick={() => handleStockChange(p.slug, -(stockChanges[p.slug] || 0))}><RemoveIcon /></IconButton>
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(p.slug)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(p.slug)}><DeleteIcon /></IconButton>
                  <Button size="small" onClick={() => openDiscount(p)}>Discount</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {modalProduct && (
        <DiscountModal
          open={true}
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onSuccess={() => { setModalProduct(null); loadProducts(); }}
        />
      )}
    </Container>
  );
};

export default ManageProducts;
