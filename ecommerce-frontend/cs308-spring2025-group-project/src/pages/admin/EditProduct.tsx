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

const genres = ["Fiction", "Non-Fiction", "Sci-Fi", "Biography", "Mystery", "Fantasy"];

const EditProduct: React.FC = () => {
  const { slug } = useParams(); // ✅ Use slug instead of id
  const navigate = useNavigate();

  const [product, setProduct] = useState({
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

  // ✅ Load product details by slug
  useEffect(() => {
    if (slug) {
      axios
        .get(`http://127.0.0.1:8000/api/products/${slug}/`)
        .then((res) => {
          const data = res.data;
          const formattedDate = data.publication_date?.slice(0, 10) || "";
          setProduct({ ...data, publication_date: formattedDate });
        })
        .catch((err) => {
          console.error("Error fetching product:", err);
          alert("Failed to load product details.");
        });
    }
  }, [slug]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(product).forEach((key) => {
      formData.append(key, (product as any)[key]);
    });
    if (image) {
      formData.append("cover_image", image);
    }

    try {
      await axios.put(`http://127.0.0.1:8000/api/products/${slug}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Product updated successfully!");
      navigate("/admin/products");
    } catch (error: any) {
      console.error("❌ Error updating product:", error.response?.data || error.message);
      alert("❌ Failed to update product.");
    }
  };

  return (
    <Container sx={{ mt: 10, maxWidth: "600px" }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" color="#EF977F" gutterBottom>
          Edit Book
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {[
              { label: "Title", name: "title" },
              { label: "Author", name: "author" },
              { label: "Price ($)", name: "price", type: "number" },
              { label: "Stock", name: "stock", type: "number" },
              { label: "ISBN", name: "isbn" },
              { label: "Pages", name: "pages", type: "number" },
              { label: "Publisher", name: "publisher" },
              { label: "Language", name: "language" },
            ].map(({ label, name, type = "text" }, i) => (
              <Grid item xs={i % 2 === 0 ? 12 : 6} key={name}>
                <TextField
                  label={label}
                  name={name}
                  fullWidth
                  required
                  type={type}
                  value={(product as any)[name]}
                  onChange={handleChange}
                />
              </Grid>
            ))}

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
                {genres.map((genre) => (
                  <MenuItem key={genre} value={genre}>
                    {genre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

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

            <Grid item xs={12} textAlign="center">
              <Typography variant="subtitle1">Upload New Book Cover (optional)</Typography>
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </Grid>

            <Grid item xs={12} textAlign="center">
              <Button type="submit" variant="contained" sx={{ backgroundColor: "#EF977F" }}>
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
