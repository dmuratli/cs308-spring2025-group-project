import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom"; // ✅ Import for navigation & params
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
  const { id } = useParams(); // ✅ Get Book ID from URL
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

  const [image, setImage] = useState<File | null>(null); // ✅ File upload state

  // ✅ Fetch existing book details
  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/products/${id}/`)
      .then((response) => setProduct(response.data))
      .catch((error) => console.error("Error fetching product:", error));
  }, [id]);

  // ✅ Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  // ✅ Handle Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  // ✅ Submit Edited Book
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
  
    // ✅ Append all text data
    Object.keys(product).forEach((key) => {
      formData.append(key, (product as any)[key]);
    });
  
    // ✅ Only append image if the user selects a new one
    if (image) {
      formData.append("cover_image", image);
    }
  
    axios
      .put(`http://127.0.0.1:8000/api/products/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        alert("Product updated successfully!");
        navigate("/admin/products"); // ✅ Redirect to Manage Products
      })
      .catch((error) => console.error("Error updating product:", error));
  };
  

  return (
    <Container sx={{ mt: 10, maxWidth: "600px" }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" color="#EF977F" gutterBottom>
          Edit Book
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label="Title" name="title" fullWidth required value={product.title} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Author" name="author" fullWidth required value={product.author} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Price ($)" name="price" type="number" fullWidth required value={product.price} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Stock" name="stock" type="number" fullWidth required value={product.stock} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="ISBN" name="isbn" fullWidth required value={product.isbn} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField select label="Genre" name="genre" fullWidth required value={product.genre} onChange={handleChange}>
                {genres.map((genre) => (
                  <MenuItem key={genre} value={genre}>
                    {genre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Pages" name="pages" type="number" fullWidth required value={product.pages} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Publisher" name="publisher" fullWidth required value={product.publisher} onChange={handleChange} />
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
            <Grid item xs={6}>
              <TextField label="Language" name="language" fullWidth required value={product.language} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" name="description" multiline rows={3} fullWidth required value={product.description} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} textAlign="center">
              <Typography variant="subtitle1">Upload New Book Cover (Required)</Typography>
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
