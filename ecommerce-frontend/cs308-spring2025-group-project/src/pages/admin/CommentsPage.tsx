import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  CircularProgress
} from '@mui/material';

// Dummy comment data
const dummyComments = [
  {
    id: 1,
    user: 'Ali Yilmaz',
    product: 'Sapiens',
    content: 'It really is a great book!',
    status: 'pending'
  },
  {
    id: 2,
    user: 'Ayşe Demir',
    product: 'The Midnight Library',
    content: 'Some parts are a little slow going but overall it is good.',
    status: 'pending'
  }
];

const CommentApprovalList = () => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setComments(dummyComments);
      setLoading(false);
    }, 500);
  }, []);

  const handleApprove = (id: number) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === id ? { ...comment, status: 'approved' } : comment
      )
    );
  };

  const handleReject = (id: number) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === id ? { ...comment, status: 'rejected' } : comment
      )
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!comments.length) {
    return <Typography sx={{ mt: 12, px: 2 }}>No comments awaiting approval found.</Typography>;
  }

  return (
    <Box sx={{ mt: 12, py: 4, px: 2 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Comment Approvals
      </Typography>

      <Grid container spacing={2}>
        {comments.map(comment => (
          <Grid item xs={12} key={comment.id}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="subtitle1">
                  <strong>{comment.user}</strong> commented on <em>{comment.product}</em>
                </Typography>
                <Typography variant="body1">{comment.content}</Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                  <Chip
                    label={comment.status}
                    color={
                      comment.status === 'approved'
                        ? 'success'
                        : comment.status === 'rejected'
                        ? 'error'
                        : 'warning'
                    }
                    variant="outlined"
                    sx={{ textTransform: 'capitalize' }}
                  />
                  <Box display="flex" gap={2}>
                    {comment.status === 'pending' && (
                      <>
                        <Button variant="contained" color="success" onClick={() => handleApprove(comment.id)}>
                          Approve
                        </Button>
                        <Button variant="outlined" color="error" onClick={() => handleReject(comment.id)}>
                          Reject
                        </Button>
                      </>
                    )}
                    {comment.status === 'approved' && (
                      <Typography color="success.main">Approved</Typography>
                    )}
                    {comment.status === 'rejected' && (
                      <Typography color="error.main">Rejected</Typography>
                    )}
                  </Box>
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
