import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  CircularProgress
} from '@mui/material';

// Dummy delivery data
const dummyDeliveries = [
  {
    id: 1,
    product: 'Sapiens',
    customer: 'Ali Yılmaz',
    quantity: 1,
    totalPrice: '18.50',
    address: 'İstanbul, Türkiye',
    delivered: false
  },
  {
    id: 2,
    product: 'The Midnight Library',
    customer: 'Ayşe Demir',
    quantity: 2,
    totalPrice: '29.98',
    address: 'Ankara, Türkiye',
    delivered: false
  }
];

const DeliveryList = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setDeliveries(dummyDeliveries);
      setLoading(false);
    }, 500);
  }, []);

  const toggleDeliveryStatus = (id: number) => {
    setDeliveries(prev =>
      prev.map(d =>
        d.id === id ? { ...d, delivered: !d.delivered } : d
      )
    );
  };

  const openInvoice = (id: number) => {
    const invoice = deliveries.find((d) => d.id === id);
    setSelectedInvoice(invoice);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!deliveries.length) {
    return <Typography sx={{ mt: 12, px: 2 }}>No deliveries found.</Typography>;
  }

  return (
    <Box sx={{ mt: 12, py: 4, px: 2 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Delivery List
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 2, width: '100%' }}>
        <Table sx={{ minWidth: 750 }}>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Product</strong></TableCell>
              <TableCell><strong>Customer</strong></TableCell>
              <TableCell><strong>Quantity</strong></TableCell>
              <TableCell><strong>Total Price</strong></TableCell>
              <TableCell><strong>Address</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Action</strong></TableCell>
              <TableCell align="center"><strong>Invoice</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deliveries.map((d) => (
              <TableRow key={d.id}>
                <TableCell>{d.id}</TableCell>
                <TableCell>{d.product}</TableCell>
                <TableCell>{d.customer}</TableCell>
                <TableCell>{d.quantity}</TableCell>
                <TableCell>{d.totalPrice}₺</TableCell>
                <TableCell>{d.address}</TableCell>
                <TableCell>
                  <Chip
                    label={d.delivered ? 'Delivered' : 'Pending'}
                    color={d.delivered ? 'success' : 'warning'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    color={d.delivered ? 'inherit' : 'primary'}
                    onClick={() => toggleDeliveryStatus(d.id)}
                    size="small"
                  >
                    {d.delivered ? 'Undo' : 'Mark as Delivered'}
                  </Button>
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => openInvoice(d.id)}
                  >
                    See invoice
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Fatura gösterimi */}
      {selectedInvoice && (
        <Box mt={4} p={3} border="1px solid #ccc" borderRadius={2}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>Invoice Details</Typography>
          <Typography><strong>Customer:</strong> {selectedInvoice.customer}</Typography>
          <Typography><strong>Product:</strong> {selectedInvoice.product}</Typography>
          <Typography><strong>Quantity:</strong> {selectedInvoice.quantity}</Typography>
          <Typography><strong>Total Price:</strong> {selectedInvoice.totalPrice}₺</Typography>
          <Typography><strong>Address:</strong> {selectedInvoice.address}</Typography>
          <Typography><strong>Status:</strong> {selectedInvoice.delivered ? 'Delivered' : 'Pending'}</Typography>
          <Button onClick={() => setSelectedInvoice(null)} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DeliveryList;
