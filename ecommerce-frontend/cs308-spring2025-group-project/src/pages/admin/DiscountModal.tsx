import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import axios from 'axios';
import { getCookie } from '../../utils/cookies';

interface DiscountModalProps {
  open: boolean;
  product: {
    id: number;
    title: string;
    price: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const DiscountModal: React.FC<DiscountModalProps> = ({ open, product, onClose, onSuccess }) => {
  const [rate, setRate] = useState<string>('');
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');

  const handleApply = async () => {
    const numericRate = parseFloat(rate);
    if (isNaN(numericRate) || numericRate <=0 || numericRate >=1) {
      alert('Rate must be between 0 and 1');
      return;
    }
    if (!start || !end) {
      alert('Set start and end');
      return;
    }
    try {
      await axios.post('/api/products/apply_discount/', {
        product_ids: [product.id],
        discount_rate: numericRate,
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
      }, {
        withCredentials: true,
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
      });
      alert('Discount applied');
      onSuccess();
    } catch(err) {
      console.error(err);
      alert('Failed to apply discount');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Apply Discount: {product.title}</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Rate (0.2 for 20%)"
          fullWidth
          margin="dense"
          type="number"
          inputProps={{ step: 0.01, min:0, max:0.99 }}
          value={rate}
          onChange={e => setRate(e.target.value)}
        />
        <TextField
          label="Start"
          fullWidth
          margin="dense"
          type="datetime-local"
          InputLabelProps={{ shrink:true }}
          value={start}
          onChange={e => setStart(e.target.value)}
        />
        <TextField
          label="End"
          fullWidth
          margin="dense"
          type="datetime-local"
          InputLabelProps={{ shrink:true }}
          value={end}
          onChange={e => setEnd(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleApply}>Apply</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiscountModal;
