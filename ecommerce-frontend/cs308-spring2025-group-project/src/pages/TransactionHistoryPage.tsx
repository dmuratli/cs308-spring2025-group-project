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
  Button                   // ← ADDED
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; // ← ADDED

interface Transaction {
  id: number;
  order_id: number;
  status: string;
  created_at: string;
}

const TransactionHistoryPage: React.FC = () => {
  const [txs, setTxs]       = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const navigate = useNavigate();              // ← ADDED

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
        <Typography variant="h4" gutterBottom>
          Your Transaction History
        </Typography>
        {txs.length === 0 ? (
          <Alert severity="info">No transactions yet</Alert>
        ) : (
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>When</TableCell>
                  <TableCell align="center">Rate & Review</TableCell> {/* ← ADDED */}
                </TableRow>
              </TableHead>
              <TableBody>
                {txs.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.id}</TableCell>
                    <TableCell>{tx.order_id}</TableCell>
                    <TableCell>{tx.status}</TableCell>
                    <TableCell>
                      {new Date(tx.created_at).toLocaleString()} {/* ← MODIFIED */}
                    </TableCell>
                    <TableCell align="center">               {/* ← ADDED */}
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          navigate(
                            `/review/${tx.order_id}/`
                          )
                        }
                      >
                        RATE & REVIEW
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