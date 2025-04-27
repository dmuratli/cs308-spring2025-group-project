// src/pages/admin/CommentsPage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

// -------- Types --------
interface PendingReview {
  id: number;
  username: string;                 
  product: { title: string };
  review_text: string;
  created_at: string;
}

// -------- Simple animation helpers --------
const fadeItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// -------- Component --------
const CommentsPage: React.FC = () => {
  const [comments, setComments] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token");

  const fetchPending = async () => {
    try {
      const res = await axios.get<PendingReview[]>(
        "http://localhost:8000/api/reviews/pending/",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const act = async (id: number, action: "approve" | "reject") => {
    await axios.post(
      `http://localhost:8000/api/reviews/${id}/${action}/`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setComments((c) => c.filter((r) => r.id !== id));
  };

  // -------- UI States --------
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress size={48} />
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

  // -------- Render --------
  return (
    <Box sx={{ mt: 12, px: 2, pb: 8 }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Pending Reviews
      </Typography>

      <Grid container spacing={3}>
        <AnimatePresence>
          {comments.map((c) => (
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
                    background:
                      "linear-gradient(135deg,#fff8f1 0%,#f9f7ff 100%)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    transition: ".3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  {/* Başlık satırı */}
                  <Typography mb={0.5} fontWeight={600}>
                    {c.username} •{" "}
                    {new Date(c.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    on <em>{c.product.title}</em>
                  </Typography>

                  {/* Yorum metni */}
                  <Typography color="text.secondary" mb={2}>
                    {c.review_text}
                  </Typography>

                  {/* Aksiyon satırı */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Chip
                      label="Pending"
                      sx={{
                        background: "#ffedd5",
                        color: "#9a3412",
                        fontWeight: 600,
                      }}
                    />

                    <Box>
                      {/* Soft-orange approve button */}
                      <Button
                        variant="contained"
                        onClick={() => act(c.id, "approve")}
                        sx={{
                          mr: 1,
                          fontWeight: 600,
                          px: 3,
                          background: "linear-gradient(90deg,#fbbf24,#f59e0b)",
                          "&:hover": {
                            background:
                              "linear-gradient(90deg,#f59e0b,#ea580c)",
                          },
                          transition: ".25s transform",
                          "&:active": { transform: "scale(0.94)" },
                        }}
                      >
                        Approve
                      </Button>

                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => act(c.id, "reject")}
                        sx={{
                          fontWeight: 600,
                          borderWidth: 2,
                          px: 3,
                          "&:hover": { borderWidth: 2 },
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
