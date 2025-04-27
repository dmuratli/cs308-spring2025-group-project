import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Grid,
  Button, Chip, CircularProgress
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

interface PendingReview {
  id: number;
  user: string;
  product: { title: string };
  review_text: string;
  created_at: string;
}

const fadeItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: .45 } }
};

const CommentsPage: React.FC = () => {
  const [comments, setComments] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('access_token');

  const fetchPending = async () => {
    try {
      const res = await axios.get<PendingReview[]>(
        'http://localhost:8000/api/reviews/pending/',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPending();  /* eslint-disable-next-line */ }, []);

  const act = async (id: number, action: 'approve' | 'reject') => {
    await axios.post(
      `http://localhost:8000/api/reviews/${id}/${action}/`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setComments(c => c.filter(r => r.id !== id));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress size={48}/>
      </Box>
    );
  }

  if (!comments.length) {
    return (
      <Box mt={12} textAlign="center">
        <Typography variant="h6" color="text.secondary">
          No comments awaiting approval.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 12, px: 2, pb: 6 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Pending Reviews
      </Typography>

      <Grid container spacing={3}>
        <AnimatePresence>
          {comments.map(c => (
            <Grid item xs={12} key={c.id}>
              <motion.div
                variants={fadeItem}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <Paper
                  elevation={4}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg,#fff8f1 0%,#f9f7ff 100%)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    transition: '.3s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                  }}
                >
                  <Typography mb={.5}>
                    <b>{c.user}</b> on <em>{c.product.title}</em>
                  </Typography>

                  <Typography color="text.secondary" mb={2}>
                    {c.review_text}
                  </Typography>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip
                      label="Pending"
                      sx={{
                        background: '#ffedd5',
                        color: '#9a3412',
                        fontWeight: 600
                      }}
                    />
                    <Box>
                      {/* soft-orange approve button */}
                      <Button
                        variant="contained"
                        onClick={() => act(c.id,'approve')}
                        sx={{
                          mr: 1,
                          fontWeight: 600,
                          background: 'linear-gradient(90deg,#fbbf24,#f59e0b)',
                          '&:hover': { background: 'linear-gradient(90deg,#f59e0b,#ea580c)' },
                          transition: '.25s transform',
                          '&:active': { transform: 'scale(.95)' }
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => act(c.id,'reject')}
                        sx={{
                          fontWeight: 600,
                          borderWidth: 2,
                          '&:hover': { borderWidth: 2 }
                        }}
                      >
                        Reject
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>
    </Box>
  );
};

export default CommentsPage;
