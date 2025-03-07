import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

const ProfilePage: React.FC = () => {
  // Fake user data (will be stored in state)
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john@example.com",
    address: "123 Main St, New York, USA",
  });

  const [isEditing, setIsEditing] = useState(false);

  // Fake order history (mock data for now)
  const orderHistory = [
    { id: 1, date: "March 5, 2024", total: "$39.99", status: "Delivered" },
    { id: 2, date: "February 20, 2024", total: "$24.99", status: "In Transit" },
    { id: 3, date: "February 10, 2024", total: "$12.99", status: "Processing" },
  ];

  // Handle input changes when editing profile
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  return (
    <Container sx={{ mt: 12, minHeight: "80vh" }}>
      <Typography variant="h4" fontWeight="bold" color="#EF977F" gutterBottom textAlign="center">
        My Profile
      </Typography>

      {/* Profile Info */}
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          User Information
        </Typography>

        {isEditing ? (
          <>
            <TextField
              label="Full Name"
              name="name"
              fullWidth
              margin="normal"
              variant="outlined"
              value={userData.name}
              onChange={handleInputChange}
            />
            <TextField
              label="Email"
              name="email"
              fullWidth
              margin="normal"
              variant="outlined"
              value={userData.email}
              onChange={handleInputChange}
            />
            <TextField
              label="Address"
              name="address"
              fullWidth
              margin="normal"
              variant="outlined"
              value={userData.address}
              onChange={handleInputChange}
            />
          </>
        ) : (
          <Box>
            <Typography><strong>Name:</strong> {userData.name}</Typography>
            <Typography><strong>Email:</strong> {userData.email}</Typography>
            <Typography><strong>Address:</strong> {userData.address}</Typography>
          </Box>
        )}

        {/* Edit and Save Buttons */}
        <Box mt={3} display="flex" justifyContent="space-between">
          {isEditing ? (
            <Button
              variant="contained"
              sx={{ backgroundColor: "#EF977F", "&:hover": { backgroundColor: "#d46c4e" } }}
              onClick={() => setIsEditing(false)}
            >
              Save Changes
            </Button>
          ) : (
            <Button
              variant="outlined"
              sx={{ borderColor: "#EF977F", color: "#EF977F" }}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </Box>
      </Paper>

      {/* Order History */}
      <Paper elevation={3} sx={{ p: 4, mt: 6, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Order History
        </Typography>
        <List>
          {orderHistory.map((order) => (
            <React.Fragment key={order.id}>
              <ListItem>
                <ListItemText
                  primary={`Order #${order.id} - ${order.date}`}
                  secondary={`Total: ${order.total} | Status: ${order.status}`}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
