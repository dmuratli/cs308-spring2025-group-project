import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Box,
  Pagination,
} from '@mui/material';

const dummyInvoices = [
  { id: 1, customer: "Ali Yılmaz", total: 250.00, date: "2025-03-10" },
  { id: 2, customer: "Ayşe Demir", total: 180.50, date: "2025-03-15" },
  { id: 3, customer: "Mehmet Öz", total: 320.75, date: "2025-03-20" },
  { id: 4, customer: "Fatma Kara", total: 150.00, date: "2025-03-22" },
  { id: 5, customer: "Hasan Demir", total: 275.25, date: "2025-03-25" },
  { id: 6, customer: "Zeynep Demir", total: 305.50, date: "2025-03-27" },

];

const InvoicesPage: React.FC = () => {
  // States for date filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // State to hold filtered invoices; initially contains all dummy invoices
  const [filteredInvoices, setFilteredInvoices] = useState(dummyInvoices);

  // States for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const invoicesPerPage = 10;

  // Filter invoices based on selected date range (reset current page on filter change)
  useEffect(() => {
    let filtered = dummyInvoices;
    if (startDate) {
      filtered = filtered.filter(invoice => invoice.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(invoice => invoice.date <= endDate);
    }
    setFilteredInvoices(filtered);
    setCurrentPage(1);
  }, [startDate, endDate]);

  // Pagination calculations
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  // Dummy actions
  const handlePrint = (invoiceId: number) => {
    console.log("Printing invoice", invoiceId);
    alert(`Printing invoice ${invoiceId}...`);
  };

  const handleExport = (invoiceId: number) => {
    console.log("Exporting invoice", invoiceId);
    alert(`Exporting invoice ${invoiceId}...`);
  };

  return (
    <Container sx={{ mt: 12, minHeight: "80vh" }}>
      <Typography variant="h4" fontWeight="bold" color="#EF977F" gutterBottom>
        Manage Invoices
      </Typography>

      {/* Filter section */}
      <Box display="flex" gap={2} mb={3} flexDirection={{ xs: 'column', sm: 'row' }}>
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={() => { setStartDate(""); setEndDate(""); }}>
          Reset Filters
        </Button>
      </Box>

      {/* Invoice table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f3f3f3' }}>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Customer</strong></TableCell>
              <TableCell><strong>Total</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{invoice.customer}</TableCell>
                <TableCell>${invoice.total.toFixed(2)}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell align="center">
                  <Button variant="outlined" onClick={() => handlePrint(invoice.id)} sx={{ mr: 1 }}>
                    Print
                  </Button>
                  <Button variant="outlined" onClick={() => handleExport(invoice.id)}>
                    Export
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {filteredInvoices.length > invoicesPerPage && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination 
            count={Math.ceil(filteredInvoices.length / invoicesPerPage)} 
            page={currentPage} 
            onChange={handlePageChange} 
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
};

export default InvoicesPage;
