import React, { useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Typography,
  MenuItem,
  Grid,
  Paper,
  Box,
} from "@mui/material";

const genres = ["Fiction", "Non-Fiction", "Sci-Fi", "Biography", "Mystery", "Fantasy"];

const AddProduct: React.FC = () => {
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
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;
  
    // ✅ Ensure publication date is in YYYY-MM-DD format
    if (name === "publication_date") {
      value = value.split(".").reverse().join("-"); // Converts "01.03.2025" -> "2025-03-01"
    }
  
    setProduct({ ...product, [name]: value });
  };
  

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
  
      // ✅ Validate image type (Only JPG/PNG allowed)
      if (!file.type.startsWith("image/")) {
        console.error("❌ Invalid file type. Please upload an image!");
        alert("❌ Invalid file type! Please upload a PNG or JPG image.");
        return;
      }
  
      setImage(file); // ✅ Store image file
      setPreview(URL.createObjectURL(file)); // ✅ Show image preview
    } else {
      console.error("❌ No file selected!"); // Debugging
    }
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
  
    // Append text data
    Object.keys(product).forEach((key) => {
      formData.append(key, (product as any)[key]);
    });
  
    // Append image file
    if (image) {
      formData.append("cover_image", image);
    }
  
    // ✅ Debugging: Log FormData content
    for (let pair of formData.entries()) {
      console.log(`📝 ${pair[0]}:`, pair[1]);
    }
  
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/products/", formData, {
        withCredentials: true,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
  
      alert("✅ Product added successfully!");
      setProduct({
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
      setImage(null);
    } catch (error: any) {
      console.error("❌ Error adding product:", error.response ? error.response.data : error);
      
      // ✅ Log the Django error response
      if (error.response) {
        console.log("🔥 Django Response Error:", error.response.data);
      }
    }
  };
  

  return (
    <Container sx={{ mt: 10, maxWidth: "600px" }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" color="#EF977F" gutterBottom>
          Add New Book
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
                InputLabelProps={{ shrink: true }} // ✅ Prevents label overlap
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
            <Typography variant="body1" fontWeight="bold" gutterBottom>
              Upload Book Cover *
            </Typography>
            <label htmlFor="cover-upload">
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "180px",
                  border: "2px dashed #EF977F",
                  borderRadius: "10px",
                  cursor: "pointer",
                  backgroundColor: "#FFF3E6",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#FFE0C2",
                    transform: "scale(1.02)",
                  },
                }}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Book Cover Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }}
                  />
                ) : (
                  <>
                    <CloudUploadIcon sx={{ fontSize: 50, color: "#EF977F", mb: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      Click to upload or drag and drop the book cover
                    </Typography>
                  </>
                )}
              </Box>
            </label>
            <input
              type="file"
              accept="image/*"
              id="cover-upload"
              onChange={handleImageChange}
              required
              style={{ display: "none" }} // ✅ Hide default file input
            />
          </Grid>

            <Grid item xs={12} textAlign="center">
              <Button type="submit" variant="contained" sx={{ backgroundColor: "#EF977F" }}>
                Add Book
              </Button>
            </Grid>
            
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AddProduct;
