import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Toolbar,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Navbar from "../../components/Navbar";

interface Genre {
  id: number;
  name: string;
}

const ManageGenres: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const token = localStorage.getItem("access_token") || "";
  const headers = { Authorization: `Bearer ${token}` };

  const fetchGenres = () => {
    setLoading(true);
    axios
      .get("/api/genres/", { headers })
      .then((r) => setGenres(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(fetchGenres, []);

  const addGenre = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      await axios.post("/api/genres/", { name }, { headers });
      setNewName("");
      fetchGenres();
      setSnackbar({ open: true, message: "Genre added", severity: "success" });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.name?.[0] || "Failed to add genre",
        severity: "error",
      });
    }
  };

  const deleteGenre = async (id: number) => {
    try {
      await axios.delete(`/api/genres/${id}/`, { headers });
      fetchGenres();
      setSnackbar({ open: true, message: "Genre deleted", severity: "success" });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.detail ||
          "Cannot delete a genre with assigned products.",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Navbar />
      <Toolbar />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="#EF977F" gutterBottom>
            Manage Genres
        </Typography>

        <Paper sx={{ p: 3, mb: 4, display: "flex", gap: 2 }}>
          <TextField
            fullWidth
            placeholder="New Genre"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button
            variant="contained"
            sx={{ backgroundColor: "#EF977F", color: "white" }}
            onClick={addGenre}
          >
            ADD
          </Button>
        </Paper>

        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Genre</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : genres.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No genres found.
                  </TableCell>
                </TableRow>
              ) : (
                genres.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell>{g.name}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => deleteGenre(g.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageGenres;