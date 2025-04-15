import React, { useState, useEffect } from "react";
import { getCookie } from "../../utils/cookies";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  TextField,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

interface Product {
  id: number;
  slug: string;
  title: string;
  author: string;
  price: number;
  stock: number;
}

interface ManageProductsProps {
  panel: "admin" | "manager";
}

const ManageProducts: React.FC<ManageProductsProps> = ({ panel }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [stockChanges, setStockChanges] = useState<Record<string, number>>({});

  const basePath = panel === "admin" ? "/admin" : "/product-manager";

  useEffect(() => {
    axios
      .get<Product[]>("http://127.0.0.1:8000/api/products/")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const handleDelete = async (slug: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/products/${slug}/`);
      setProducts((prev) => prev.filter((p) => p.slug !== slug));
      alert("✅ Product deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      alert("❌ Failed to delete product.");
    }
  };

  const handleStockChange = (slug: string, change: number) => {
    if (!change || change === 0) return;

    axios
      .post(
        `http://127.0.0.1:8000/api/products/${slug}/adjust_stock/`,
        { change },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
          },
        }
      )
      .then((res) => {
        setProducts((prev) =>
          prev.map((p) => (p.slug === slug ? { ...p, stock: res.data.stock } : p))
        );
        setStockChanges((prev) => ({ ...prev, [slug]: 0 }));
      })
      .catch((err) => {
        console.error("Error adjusting stock:", err);
        alert("❌ Stock update failed.");
      });
  };

  const handleInputChange = (slug: string, value: string) => {
    const number = parseInt(value, 10);
    setStockChanges((prev) => ({
      ...prev,
      [slug]: isNaN(number) ? 0 : number,
    }));
  };

  const handleEdit = (slug: string) => {
    navigate(`${basePath}/edit-product/${slug}`);
  };

  return (
    <Container sx={{ mt: 12, minHeight: "80vh" }}>
      <Typography variant="h4" fontWeight="bold" color="#EF977F" gutterBottom>
        {panel === "admin" ? "Admin Panel - Manage Products" : "Product Manager - Manage Products"}
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ mb: 2, backgroundColor: "#4CAF50" }}
        onClick={() => navigate(`${basePath}/add-product`)}
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
              <TableCell>Adjust Stock</TableCell>
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                      size="small"
                      type="number"
                      value={stockChanges[product.slug] || ""}
                      onChange={(e) => handleInputChange(product.slug, e.target.value)}
                      placeholder="0"
                      sx={{ width: 60 }}
                    />
                    <IconButton
                      color="success"
                      onClick={() =>
                        handleStockChange(product.slug, stockChanges[product.slug] || 0)
                      }
                    >
                      <AddIcon />
                    </IconButton>
                    <IconButton
                      color="warning"
                      onClick={() =>
                        handleStockChange(product.slug, -(stockChanges[product.slug] || 0))
                      }
                    >
                      <RemoveIcon />
                    </IconButton>
                  </Box>
                </TableCell>

                <TableCell>
                  <IconButton color="primary" onClick={() => handleEdit(product.slug)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(product.slug)}>
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
