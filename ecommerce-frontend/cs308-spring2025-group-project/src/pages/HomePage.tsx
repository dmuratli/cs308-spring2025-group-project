import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/products/")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Failed to fetch products", err));
  }, []);

  const newArrivals = [...products]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 3);

  const bestSellers = [...products]
    .sort((a, b) => (b.ordered_number ?? 0) - (a.ordered_number ?? 0))
    .slice(0, 3);

  const LearnMoreBtn: React.FC<{
    onClick: () => void;
    full?: boolean;
  }> = ({ onClick, full }) => (
    <Button
      component={motion.button}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.93 }}
      fullWidth={full}
      onClick={onClick}
      sx={{
        mt: 2,
        py: 1,
        fontWeight: 700,
        letterSpacing: 0.4,
        background: "linear-gradient(90deg,#ffd27d 0%,#ffaf64 50%,#ffa057 100%)",
        color: "#5a2700",
        boxShadow: "0 3px 12px rgba(0,0,0,.12)",
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
        "&:hover": {
          background:
            "linear-gradient(90deg,#ffa057 0%,#ffaf64 50%,#ffd27d 100%)",
        },
      }}
      endIcon={
        <motion.span
          initial={{ x: 0 }}
          whileHover={{ x: 4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{ display: "flex", alignItems: "center" }}
        >
          <ArrowForwardRoundedIcon sx={{ fontSize: 20 }} />
        </motion.span>
      }
    >
      Learn&nbsp;More
    </Button>
  );

  return (
    <Box>
      <Navbar />

      {/* ─── Hero ─────────────────────────────── */}
      <Box
        sx={{
          height: 420,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          color: "black",
          p: 2,
          overflow: "hidden",
        }}
      >
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
          src="https://i.ibb.co/CssQMFQj/DALL-E-2025-03-06-14-57-55-A-beautiful-and-immersive-book-themed-background-image-for-an-online-book.webp"
          alt="books"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.25,
            zIndex: -1,
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Typography variant="h3" fontWeight={700}>
            A Book Can Change Your Life
          </Typography>

          <Button
            component={motion.button}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            variant="contained"
            onClick={() => navigate("/products")}
            sx={{
              mt: 3,
              background: "linear-gradient(90deg,#f9a826 0%,#ef977f 100%)",
              color: "white",
              px: 4,
              py: 1.3,
              fontSize: "1.05rem",
              borderRadius: 3,
              boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
            }}
          >
            Shop Now
          </Button>
        </motion.div>
      </Box>

      {/* ─── Bestsellers (real) ───────────────── */}
      <Container sx={{ my: 8 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={3}>
          Bestsellers
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          mb={5}
        >
          Discover our top-rated books loved by readers!
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {bestSellers.map((p, idx) => (
            <Grid item xs={12} sm={6} md={4} key={p.id}>
              <motion.div
                custom={idx}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeIn}
              >
                <Card
                  component={motion.div}
                  whileHover={{ scale: 1.03 }}
                  sx={{ boxShadow: 4, borderRadius: 3 }}
                >
                  <CardMedia
                    component="img"
                    height="220"
                    image={p.cover_image || "https://via.placeholder.com/250x350?text=No+Image"}
                    alt={p.title}
                  />
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" noWrap>
                      {p.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                      gutterBottom
                    >
                      {p.genre}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      ${p.price}
                    </Typography>

                    <LearnMoreBtn
                      onClick={() => navigate(`/products/${p.slug}`)}
                      full
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ─── Reviews ──────────────────────────── */}
      <Box sx={{ bgcolor: "#fafafa", py: 7 }}>
        <Container>
          <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>
            What Our Readers Say
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {[
              {
                text: `"This bookstore changed my reading experience – amazing selection and fast delivery!"`,
                name: "John Doe",
              },
              {
                text: `"Great books, fantastic service, unbeatable prices!"`,
                name: "Jane Smith",
              },
            ].map((review, i) => (
              <Grid item xs={12} md={6} key={review.name}>
                <motion.div
                  custom={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeIn}
                >
                  <Box
                    sx={{
                      p: 3,
                      borderLeft: "4px solid #ef977f",
                      bgcolor: "white",
                      borderRadius: 2,
                      boxShadow: 3,
                    }}
                  >
                    <Typography variant="body1" mb={1}>
                      {review.text}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold">
                      — {review.name}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── New Arrivals ─────────────────────── */}
      <Container sx={{ my: 8 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={3}>
          New Arrivals
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          mb={5}
        >
          Get the latest books just added to our store!
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {newArrivals.map((p, idx) => (
            <Grid item xs={12} sm={6} md={4} key={p.id}>
              <motion.div
                custom={idx}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeIn}
              >
                <Card
                  component={motion.div}
                  whileHover={{ scale: 1.03 }}
                  sx={{ boxShadow: 4, borderRadius: 3 }}
                >
                  <CardMedia
                    component="img"
                    height="220"
                    image={p.cover_image || "https://via.placeholder.com/250x350?text=No+Image"}
                    alt={p.title}
                  />
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" noWrap>
                      {p.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                      gutterBottom
                    >
                      {p.genre}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      ${p.price}
                    </Typography>

                    <LearnMoreBtn
                      onClick={() => navigate(`/products/${p.slug}`)}
                      full
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ─── Footer ──────────────────────────── */}
      <Box
        sx={{
          background: "linear-gradient(90deg,#ef977f 0%,#f9a826 100%)",
          color: "white",
          textAlign: "center",
          py: 6,
          px: 2,
          mt: 8,
        }}
      >
        <Typography variant="h4" fontWeight={700} mb={1}>
          Start Your Reading Journey
        </Typography>
        <Typography variant="body1">
          Find your next favorite book and embark on an adventure through pages.
        </Typography>

        <Button
          component={motion.button}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          variant="contained"
          sx={{
            mt: 3,
            background: "white",
            color: "#ef977f",
            px: 4,
            fontWeight: 600,
          }}
        >
          Contact Us
        </Button>
      </Box>
    </Box>
  );
};

export default HomePage;
