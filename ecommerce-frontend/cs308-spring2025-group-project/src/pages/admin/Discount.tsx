import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TextField,
  Button,
  Box,
  Paper,
} from '@mui/material';
import { getCookie } from '../../utils/cookies';

interface Product {
  id: number;
  title: string;
  price: number;
  discounted_price?: number;
}

const Discount: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [rate, setRate] = useState<string>('');
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get<Product[]>('/api/products/');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load products');
    }
  };

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const applyDiscount = async () => {
    if (selectedIds.size === 0) {
      alert('Select at least one product');
      return;
    }
    const numericRate = parseFloat(rate);
    if (isNaN(numericRate) || numericRate <= 0 || numericRate >= 1) {
      alert('Enter a discount between 0 and 1');
      return;
    }
    if (!start || !end) {
      alert('Set start and end dates');
      return;
    }
    setLoading(true);
    try {
      const csrfToken = getCookie('csrftoken');
      const payload = {
        product_ids: Array.from(selectedIds),
        discount_rate: numericRate,
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
      };
      const res = await axios.post(
        '/api/products/apply_discount/',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          },
        }
      );
      alert(`${res.data.updated} products updated`);
      fetchProducts();
      setSelectedIds(new Set());
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data.error || 'Failed to apply discount');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Bulk Discount
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Title</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Disc. Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(p.id)}
                    onChange={() => toggleSelect(p.id)}
                  />
                </TableCell>
                <TableCell>{p.title}</TableCell>
                <TableCell>{Number(p.price).toFixed(2)}</TableCell>
                <TableCell>
                  {p.discounted_price !== undefined
                    ? Number(p.discounted_price).toFixed(2)
                    : '--'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" gap={2} mt={3} alignItems="center">
        <TextField
          label="Discount Rate"
          type="number"
          inputProps={{ step: 0.01, min: 0, max: 0.99 }}
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
        <TextField
          label="Start Date"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <TextField
          label="End Date"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={applyDiscount}
          disabled={loading}
        >
          {loading ? 'Applying...' : 'Apply'}
        </Button>
      </Box>
    </Container>
  );
};

export default Discount;
