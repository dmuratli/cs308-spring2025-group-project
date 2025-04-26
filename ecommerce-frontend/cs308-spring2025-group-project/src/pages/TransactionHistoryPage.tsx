import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Toolbar,
  Paper,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Transaction {
  id: number;
  order_id: number;
  status: string;
  created_at: string;
}

const TransactionHistoryPage: React.FC = () => {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTxs = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const res = await fetch('http://localhost:8000/api/payment/transactions/', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const payload = await res.json();
          throw new Error(payload.detail || 'Failed to load transactions');
        }
        const data: Transaction[] = await res.json();
        setTxs(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTxs();
  }, []);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <>
      <Toolbar />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Your Transaction History
        </Typography>
        {txs.length === 0 ? (
          <Alert severity="info">No transactions yet</Alert>
        ) : (
          <Paper
            sx={{
              overflowX: 'auto',
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              p: 2,
            }}
          >
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: '#fef3c7',
                  }}
                >
                  <TableCell><strong>Transaction ID</strong></TableCell>
                  <TableCell><strong>Order ID</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>When</strong></TableCell>
                  <TableCell align="center"><strong>Rate & Review</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {txs.map((tx) => (
                  <TableRow
                    key={tx.id}
                    sx={{
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: '#fff7ed',
                        transform: 'scale(1.01)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      },
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <TableCell>{tx.id}</TableCell>
                    <TableCell>{tx.order_id}</TableCell>
                    <TableCell>{tx.status}</TableCell>
                    <TableCell>
                      {new Date(tx.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        onClick={() => navigate(`/review/${tx.order_id}/`)}
                        sx={{
                          background: 'linear-gradient(45deg, #f6ad55, #f97316)',
                          color: 'white',
                          fontWeight: 'bold',
                          borderRadius: 3,
                          px: 2,
                          py: 0.5,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #f97316, #ea580c)',
                            transform: 'scale(1.05)',
                          },
                          '&:active': {
                            transform: 'scale(0.97)',
                          },
                        }}
                        size="small"
                      >
                        Rate & Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Container>
    </>
  );
};

export default TransactionHistoryPage;
