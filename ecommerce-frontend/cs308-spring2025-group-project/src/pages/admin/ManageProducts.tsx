import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ Import for navigation
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

// Define the Product type
interface Product {
  id: number;
  title: string;
  author: string;
  price: number;
  stock: number;
}

const ManageProducts: React.FC = () => {
  const navigate = useNavigate(); // ✅ Navigation Hook
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch Products from Django API
  useEffect(() => {
    axios.get<Product[]>("http://127.0.0.1:8000/api/products/")
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  // Delete Product
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/products/${id}/`);
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
      alert("✅ Product deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      alert("❌ Failed to delete product.");
    }
  };

  // Edit Product
  const handleEdit = (id: number) => {
    navigate(`/admin/edit-product/${id}`); // ✅ Redirect to Edit Page
  };

  return (
    <Container sx={{ mt: 12, minHeight: "80vh" }}>
      <Typography variant="h4" fontWeight="bold" color="#EF977F" gutterBottom>
        Manage Products
      </Typography>

      {/* ✅ Button Redirects to Add Product Page */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ mb: 2, backgroundColor: "#4CAF50" }}
        onClick={() => navigate("/admin/add-product")} // ✅ Redirects to Add Product Page
      >
        Add New Product
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.title}</TableCell>
                <TableCell>{product.author}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                <IconButton color="primary" onClick={() => navigate(`/admin/edit-product/${product.id}`)}>
                  <EditIcon />
                </IconButton>

                  <IconButton color="error" onClick={() => handleDelete(product.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ManageProducts;
