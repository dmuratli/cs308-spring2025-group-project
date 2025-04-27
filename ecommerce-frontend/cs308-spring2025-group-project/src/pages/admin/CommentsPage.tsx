import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Grid,
  Button, Chip, CircularProgress
} from '@mui/material';

interface PendingReview {
  id: number;
  user: string;
  product: { title: string };
  review_text: string;
  created_at: string;
}

const CommentApprovalList: React.FC = () => {
  const [comments, setComments] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    const token = localStorage.getItem('access_token');
    const res = await axios.get<PendingReview[]>(
      'http://localhost:8000/api/reviews/pending/',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setComments(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchPending() }, []);

  const handleApprove = async (id: number) => {
    const token = localStorage.getItem('access_token');
    await axios.post(
      `http://localhost:8000/api/reviews/${id}/approve/`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setComments(c => c.filter(r => r.id !== id));
  };

  const handleReject = async (id: number) => {
    const token = localStorage.getItem('access_token');
    await axios.post(
      `http://localhost:8000/api/reviews/${id}/reject/`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setComments(c => c.filter(r => r.id !== id));
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" mt={4}><CircularProgress/></Box>;
  }
  if (!comments.length) {
    return <Typography sx={{ mt:12, px:2 }}>No comments awaiting approval.</Typography>;
  }

  return (
    <Box sx={{ mt:4, px:2 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Pending Reviews
      </Typography>
      <Grid container spacing={2}>
        {comments.map(c => (
          <Grid item xs={12} key={c.id}>
            <Paper sx={{ p:3 }}>
              <Typography>
                <strong>{c.user}</strong> on <em>{c.product.title}</em>
              </Typography>
              <Typography sx={{ my:1 }}>{c.review_text}</Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Chip label="Pending" color="warning" />
                <Box>
                  <Button
                    variant="contained"
                    color="success"
                    sx={{ mr:1 }}
                    onClick={() => handleApprove(c.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleReject(c.id)}
                  >
                    Reject
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CommentApprovalList;