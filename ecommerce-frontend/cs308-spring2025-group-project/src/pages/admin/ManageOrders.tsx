import React, { useState, useEffect } from "react";
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
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

interface Order {
  id:        number;
  customer:  string;
  total:     string;
  status:    string;
  shipping_address_line1?: string;
  shipping_address_line2?: string;
  shipping_city?:          string;
  shipping_postal_code?:   string;
}

const validTransitions: Record<string, string[]> = {
  Processing: ["Shipped", "Cancelled"],
  Shipped:    ["Delivered"],
  Delivered:  ["Refunded"],
  Refunded:   [],
};

const ManageOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      window.alert("You must log in first!");
      return;
    }

    fetch("http://127.0.0.1:8000/api/orders/", {
      method: "GET",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load orders (${res.status})`);
        return res.json();
      })
      .then((data: any[]) => {
        const formatted: Order[] = data.map((o) => ({
          id:       o.id,
          customer: o.customer,
          total:    `$${parseFloat(o.total as string).toFixed(2)}`,
          status:   o.status,
          // map the shipping fields from the API response
          shipping_address_line1: o.shipping_address_line1,
          shipping_address_line2: o.shipping_address_line2,
          shipping_city:          o.shipping_city,
          shipping_postal_code:   o.shipping_postal_code,
        }));
        setOrders(formatted);
      })
      .catch((err) => window.alert(err.message));
  }, [token]);

  const handleStatusChange = (id: number, newStatus: string) => {
    if (!token) {
      window.alert("You must log in to update status");
      return;
    }
    if (!window.confirm("Are you sure you want to change the order status?")) return;

    fetch(`http://127.0.0.1:8000/api/orders/${id}/status/`, {
      method: "PATCH",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid transition or permission denied");
        return res.json();
      })
      .then(() =>
        setOrders((prev) =>
          prev.map((o) =>
            o.id === id ? { ...o, status: newStatus } : o
          )
        )
      )
      .catch((err) => window.alert(err.message));
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Delete this order permanently?")) return;
    fetch(`http://127.0.0.1:8000/api/orders/${id}/`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 204) {
          setOrders((prev) => prev.filter((o) => o.id !== id));
        } else {
          throw new Error(`Delete failed (${res.status})`);
        }
      })
      .catch((err) => window.alert(err.message));
  };

  if (!token) {
    return null;
  }

  return (
    <Container sx={{ mt: 12, minHeight: "80vh" }}>
      <Typography variant="h4" fontWeight="bold" color="#EF977F" gutterBottom>
        Manage Orders
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Shipping Address</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.total}</TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value as string)
                    }
                  >
                    <MenuItem value={order.status} disabled>
                      {order.status}
                    </MenuItem>
                    {(validTransitions[order.status] || []).map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  {order.shipping_address_line1}<br/>
                  {order.shipping_address_line2 && (
                    <>{order.shipping_address_line2}<br/></>
                  )}
                  {order.shipping_city}, {order.shipping_postal_code}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(order.id)}
                  >
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

export default ManageOrders;