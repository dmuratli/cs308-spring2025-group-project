// src/pages/admin/InvoicesPage.tsx

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
  Paper,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import Pagination from '@mui/material/Pagination';
import { Print, PictureAsPdf } from '@mui/icons-material';

const API_BASE = 'http://localhost:8000/api';

interface Invoice {
  id: number;
  customer: string;
  total: number;
  date: string;
}

interface RawInvoice {
  id: number;
  customer: string;
  total: string | number;
  date: string;
}

export default function InvoicesPage() {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate]     = useState<string>('');
  const [invoices, setInvoices]   = useState<Invoice[]>([]);
  const [loading, setLoading]     = useState<boolean>(false);
  const [error, setError]         = useState<string>('');

  const [page, setPage] = useState<number>(1);
  const perPage        = 10;
  const count          = Math.ceil(invoices.length / perPage);
  const current        = invoices.slice((page-1)*perPage, page*perPage);

  const fetchInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token') || '';
      const resp  = await axios.get<RawInvoice[]>(`${API_BASE}/invoices/`, {
        params: { start: startDate, end: endDate },
        headers: { Authorization: `Bearer ${token}` },
      });

      const normalized = resp.data.map(inv => ({
        id:       inv.id,
        customer: inv.customer,
        total:    typeof inv.total === 'string' ? parseFloat(inv.total) : inv.total,
        date:     inv.date,
      }));
      setInvoices(normalized);
      setPage(1);
    } catch {
      setError('Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const reset = () => {
    setStartDate('');
    setEndDate('');
    fetchInvoices();
  };

  const handlePrint = async (id: number) => {
    try {
      const token = localStorage.getItem('access_token') || '';
      const res = await axios.get(`${API_BASE}/invoices/${id}/html/`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'text',
      });
      const w = window.open();
      if (!w) return;
      w.document.open();
      w.document.write(res.data);
      w.document.close();
      w.focus();
      w.print();
    } catch {
      alert('Failed to load invoice for printing.');
    }
  };

  const handleExport = async (id: number) => {
    try {
      const token = localStorage.getItem('access_token') || '';
      const res = await axios.get(`${API_BASE}/invoices/${id}/pdf/`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url  = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      alert('Failed to download PDF.');
    }
  };

  return (
    <Container sx={{ mt: 12, minHeight: '80vh' }}>
      <Typography variant="h4" fontWeight="bold" color="#EF977F" gutterBottom>
        Manage Invoices
      </Typography>

      <Box display="flex" flexDirection={{ xs:'column', sm:'row' }} gap={2} mb={3}>
        <TextField
          label="Start Date" type="date" value={startDate}
          onChange={e => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }} sx={{ flex: 1 }}
        />
        <TextField
          label="End Date" type="date" value={endDate}
          onChange={e => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }} sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          onClick={fetchInvoices}
          sx={{
            bgcolor: '#FFA559',
            '&:hover': { bgcolor: '#e68e3f' },
            color: '#fff',
            fontWeight: 'bold',
          }}
        >
          Fetch
        </Button>
        <Button
          variant="outlined"
          onClick={reset}
          sx={{
            borderColor: '#FFA559',
            color: '#FFA559',
            '&:hover': { borderColor: '#e68e3f', color: '#e68e3f' },
            fontWeight: 'bold',
          }}
        >
          Reset
        </Button>
      </Box>

      {loading && <Box textAlign="center"><CircularProgress sx={{ color: '#FFA559' }} /></Box>}
      {error   && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#FFF5EC' }}>
                <TableRow>
                  {['ID','Customer','Total','Date','Actions'].map(h => (
                    <TableCell key={h} align={h==='Actions'?'center':'left'}>
                      <strong>{h}</strong>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {current.map(inv => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.id}</TableCell>
                    <TableCell>{inv.customer}</TableCell>
                    <TableCell>${inv.total.toFixed(2)}</TableCell>
                    <TableCell>{inv.date}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        startIcon={<Print />}
                        onClick={() => handlePrint(inv.id)}
                        sx={{
                          mr:1,
                          borderColor: '#FFA559',
                          color: '#FFA559',
                          textTransform: 'none',
                          '&:hover': { borderColor: '#e68e3f', color: '#e68e3f' },
                        }}
                      >
                        Print
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<PictureAsPdf />}
                        onClick={() => handleExport(inv.id)}
                        sx={{
                          borderColor: '#FFA559',
                          color: '#FFA559',
                          textTransform: 'none',
                          '&:hover': { borderColor: '#e68e3f', color: '#e68e3f' },
                        }}
                      >
                        Export
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {invoices.length===0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No invoices found for this period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {count>1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={count}
                page={page}
                onChange={(_,v) => setPage(v)}
                sx={{ '& .Mui-selected': { bgcolor:'#FFA559', color:'#fff' } }}
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
