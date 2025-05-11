import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  MenuItem,
  Grid,
  Paper,
} from "@mui/material";

interface Genre {
  id: number;
  name: string;
}

const EditProduct: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>({
    title: "",
    author: "",
    price: "",
    stock: "",
    isbn: "",
    genre: "",
    description: "",
    publisher: "",
    publication_date: "",
    pages: "",
    language: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    if (!slug) return;

    // load product
    axios
      .get(`http://127.0.0.1:8000/api/products/${slug}/`)
      .then((res) => {
        const data = res.data;
        setProduct({
          ...data,
          publication_date: data.publication_date?.slice(0, 10) || "",
        });
      })
      .catch(() => alert("Failed to load product details."));

    // load genres
    axios
      .get("http://127.0.0.1:8000/api/genres/")
      .then((res) => setGenres(res.data))
      .catch(() => setGenres([]));
  }, [slug]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct((p: any) => ({
      ...p,
      [name]: name === "genre" ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setImage(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(product).forEach(([k, v]) =>
      formData.append(k, v as string)
    );
    if (image) formData.append("cover_image", image);

    try {
      await axios.put(
        `http://127.0.0.1:8000/api/products/${slug}/`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
            "X-CSRFToken": localStorage.getItem("csrftoken") || "",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      alert("✅ Product updated successfully!");
      navigate("/product-manager/manage-products");
    } catch (err: any) {
      console.error(err.response?.data || err);
      alert("❌ Failed to update product.");
    }
  };

  return (
    <Container sx={{ mt: 10, maxWidth: "600px" }}>
      <Paper sx={{ p: 4 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          color="#EF977F"
          gutterBottom
        >
          Edit Book
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Title – full width */}
            <Grid item xs={12}>
              <TextField
                label="Title"
                name="title"
                fullWidth
                required
                value={product.title}
                onChange={handleChange}
              />
            </Grid>

            {/* Author – full width */}
            <Grid item xs={12}>
              <TextField
                label="Author"
                name="author"
                fullWidth
                required
                value={product.author}
                onChange={handleChange}
              />
            </Grid>

            {/* Price + Stock – half + half */}
            <Grid item xs={6}>
              <TextField
                label="Price ($)"
                name="price"
                type="number"
                fullWidth
                required
                value={product.price}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Stock"
                name="stock"
                type="number"
                fullWidth
                required
                value={product.stock}
                onChange={handleChange}
              />
            </Grid>

            {/* ISBN – full width */}
            <Grid item xs={12}>
              <TextField
                label="ISBN"
                name="isbn"
                fullWidth
                required
                value={product.isbn}
                onChange={handleChange}
              />
            </Grid>

            {/* Genre + Pages – half + half */}
            <Grid item xs={6}>
              <TextField
                select
                label="Genre"
                name="genre"
                fullWidth
                required
                value={product.genre}
                onChange={handleChange}
              >
                {genres.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Pages"
                name="pages"
                type="number"
                fullWidth
                required
                value={product.pages}
                onChange={handleChange}
              />
            </Grid>

            {/* Publisher – full width */}
            <Grid item xs={12}>
              <TextField
                label="Publisher"
                name="publisher"
                fullWidth
                required
                value={product.publisher}
                onChange={handleChange}
              />
            </Grid>

            {/* Publication Date + Language – half + half */}
            <Grid item xs={6}>
              <TextField
                label="Publication Date"
                name="publication_date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={product.publication_date}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Language"
                name="language"
                fullWidth
                required
                value={product.language}
                onChange={handleChange}
              />
            </Grid>

            {/* Description – full width */}
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                multiline
                rows={3}
                fullWidth
                required
                value={product.description}
                onChange={handleChange}
              />
            </Grid>

            {/* Image upload */}
            <Grid item xs={12} textAlign="center">
              <Typography variant="subtitle1">
                Upload New Book Cover (optional)
              </Typography>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </Grid>

            {/* Submit button */}
            <Grid item xs={12} textAlign="center">
              <Button
                type="submit"
                variant="contained"
                sx={{ backgroundColor: "#EF977F" }}
              >
                Update Book
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default EditProduct;