import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  IconButton,
  InputLabel,
  FormControl,
  Typography,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const StockChart = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/api/products/')
      .then((response) => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const handleStockUpdate = (product: any, change: number) => {
    axios
      .post(`http://127.0.0.1:8000/api/products/${product.slug}/adjust_stock/`, {
        change: change
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        const updatedStock = res.data.stock;
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, stock: updatedStock } : p))
        );
      })
      .catch((err) => {
        console.error("Failed to update stock", err);
      });
  };

  const categories = ['All', ...new Set(products.map((p) => p.genre))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.genre === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" textAlign="center">
        Failed to fetch product data.
      </Typography>
    );

  return (
    <Box mt={10}>
      {/* Filters */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} mb={3}>
        <TextField
          label="Search by product name"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat, index) => (
              <MenuItem key={index} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Product Table */}
      {filteredProducts.length === 0 ? (
        <Typography>No products found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f3f3f3' }}>
              <TableRow>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell><strong>Stock</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell align="center"><strong>Adjust</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.title}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.genre}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="error"
                      onClick={() => handleStockUpdate(product, -1)}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleStockUpdate(product, 1)}
                    >
                      <AddIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default StockChart;
