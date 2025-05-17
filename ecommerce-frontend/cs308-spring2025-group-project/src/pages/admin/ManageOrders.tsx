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

interface RawOrder {
  id:                       number;
  customer:                 string | { id: number; username?: string; name?: string };
  user?:                    number;
  customer_id?:             number;
  total:                    string;
  status:                   string;
  items?:                   { product_title: string; quantity: number }[];
  shipping_address_line1?:  string;
  shipping_address_line2?:  string;
  shipping_city?:           string;
  shipping_postal_code?:    string;
}

interface Order {
  id:                       number;
  customer:                 string;
  customerId:               number;
  total:                    string;
  status:                   string;
  quantity:                 number;
  itemsDesc:                string;
  shipping_address_line1?:  string;
  shipping_address_line2?:  string;
  shipping_city?:           string;
  shipping_postal_code?:    string;
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
      .then((data: RawOrder[]) => {
        const formatted: Order[] = data.map((o) => {
          // pick a numeric customer ID from whichever field exists
          const customerId: number =
            o.user ??
            o.customer_id ??
            (typeof o.customer === "object" ? o.customer.id : undefined) ??
            0;

          // extract the human-readable name
          const customerName: string =
            typeof o.customer === "string"
              ? o.customer
              : o.customer.username ?? o.customer.name ?? "";

          // sum quantities
          const quantity: number = Array.isArray(o.items)
            ? o.items.reduce((sum, i) => sum + (i.quantity || 0), 0)
            : 0;

          const itemsDesc: string = Array.isArray(o.items)
            ? o.items.map(i => `${i.quantity}x ${i.product_title}`).join(", ")
            : "";
          return {
            id:                      o.id,
            customer:                customerName,
            customerId,
            total:                   `$${parseFloat(o.total).toFixed(2)}`,
            status:                  o.status,
            quantity,
            itemsDesc,
            shipping_address_line1:  o.shipping_address_line1,
            shipping_address_line2:  o.shipping_address_line2,
            shipping_city:           o.shipping_city,
            shipping_postal_code:    o.shipping_postal_code,
          };
        });

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
          prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
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
              <TableCell>Customer ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Total Quantity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Shipping Address</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customerId}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.itemsDesc}</TableCell>
                <TableCell>{order.total}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value as string)
                    }
                    size="small"
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
                  {order.shipping_address_line1}
                  <br />
                  {order.shipping_address_line2 && (
                    <>
                      {order.shipping_address_line2}
                      <br />
                    </>
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