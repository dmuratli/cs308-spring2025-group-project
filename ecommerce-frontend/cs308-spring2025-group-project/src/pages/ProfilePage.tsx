import React, { useState, useCallback, useMemo, useEffect } from "react";
import { getCSRFToken } from "../context/AuthContext";
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
  Avatar,
  Fade,
  keyframes,
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Save as SaveIcon, 
  LocalShipping as ShippingIcon, 
  Inventory as InventoryIcon, 
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Define types for our data models
interface UserData {
  name: string;
  email: string;
  address: string;
}

interface Order {
  id: number;
  date: string;
  total: string;
  status: string;
}

// Create a horizontal loop animation for the truck
const truckLoopAnimation = keyframes`
  0% { transform: translateX(-20px); opacity: 0; }
  10% { transform: translateX(0); opacity: 1; }
  80% { transform: translateX(40px); opacity: 1; }
  100% { transform: translateX(60px); opacity: 0; }
`;

// Create a styled ShippingIcon that moves in a loop
const MovingTruck = styled(ShippingIcon)(({ theme }) => ({
  animation: `${truckLoopAnimation} 2s infinite`,
  color: "#2196f3",
}));

// Predefined style objects to prevent recreating on each render
const styles = {
  headerText: {
    position: "relative",
    background: "linear-gradient(45deg, #EF977F 30%, #f5b39e 90%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    "&:after": {
      content: '""',
      position: "absolute",
      bottom: -10,
      left: "50%",
      transform: "translateX(-50%)",
      width: "80px",
      height: "3px",
      background: "linear-gradient(45deg, #EF977F 30%, #f5b39e 90%)",
      borderRadius: "4px",
    }
  },
  paperStyles: {
    p: 4,
    borderRadius: "12px",
    transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
    "&:hover": {
      boxShadow: "rgba(239, 151, 127, 0.1) 0px 10px 20px, rgba(239, 151, 127, 0.08) 0px 6px 6px",
      transform: "translateY(-4px)"
    },
    borderLeft: "4px solid #EF977F"
  },
  avatarStyles: {
    width: 64, 
    height: 64, 
    background: "linear-gradient(45deg, #EF977F 30%, #d46c4e 90%)",
    color: "white",
    mr: 2,
    fontSize: "1.5rem",
    fontWeight: "bold",
    boxShadow: "0 4px 8px rgba(239, 151, 127, 0.3)"
  },
  savedButton: {
    background: "linear-gradient(45deg, #EF977F 30%, #d46c4e 90%)",
    "&:hover": { 
      background: "linear-gradient(45deg, #d46c4e 30%, #c05c3e 90%)" 
    },
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(239, 151, 127, 0.3)",
    px: 3,
    py: 1
  },
  editButton: {
    borderColor: "#EF977F", 
    color: "#EF977F",
    "&:hover": {
      borderColor: "#d46c4e",
      backgroundColor: "rgba(239, 151, 127, 0.20)"
    },
    borderRadius: "8px",
    px: 3,
    py: 1
  },
  textFieldStyles: { 
    mb: 3,
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": {
        borderColor: "#EF977F"
      },
      "&:hover fieldset": {
        borderColor: "#f5b39e"
      }
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#EF977F"
    }
  },
  listItemHover: {
    py: 2,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.03)",
      borderRadius: "8px"
    }
  },
  statusIconContainer: {
    mr: 1,
    width: "30px",  
    position: "relative",
    overflow: "hidden"
  }
};

// Status colors map
const STATUS_COLORS: Record<string, string> = {
  "Delivered": "#4caf50",
  "In Transit": "#2196f3",
  "Processing": "#ff9800",
  "Refunded": "#f44336"
};

// Component props interfaces
interface StatusIconProps {
  status: string;
}

interface OrderItemProps {
  order: Order;
}

interface OrderStatusSectionProps {
  status: string;
  orders: Order[];
}

// Memoized Status Icon component
const StatusIcon: React.FC<StatusIconProps> = React.memo(({ status }) => {
  switch (status) {
    case "Delivered":
      return <CheckCircleIcon sx={{ color: STATUS_COLORS.Delivered }} />;
    case "In Transit":
      return <MovingTruck />;
    case "Processing":
      return <InventoryIcon sx={{ color: STATUS_COLORS.Processing }} />;
    case "Refunded":
      return <EditIcon sx={{ color: STATUS_COLORS.Refunded }} />;
    default:
      return null;
  }
});

// Order item component to reduce re-renders
const OrderItem: React.FC<OrderItemProps> = React.memo(({ order }) => (
  <React.Fragment>
    <ListItem alignItems="flex-start" sx={styles.listItemHover}>
      <ListItemText
        primary={
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body1" fontWeight="medium">
              Order #{order.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.date}
            </Typography>
          </Box>
        }
        secondary={
          <Typography
            component="span"
            variant="body2"
            sx={{ display: 'block', fontWeight: "medium", mt: 0.5 }}
          >
            Total: {order.total}
          </Typography>
        }
      />
    </ListItem>
    <Divider component="li" sx={{ opacity: 0.4 }} />
  </React.Fragment>
));

// Order status section component
const OrderStatusSection: React.FC<OrderStatusSectionProps> = React.memo(({ status, orders }) => {
  const filteredOrders = useMemo(() => 
    orders.filter(order => order.status === status), 
    [orders, status]
  );
  
  // Only show sections that have orders (except for "Refunded" which shows empty state)
  // if (filteredOrders.length === 0 && status !== "Refunded") return null;
  
  return (
    <Box sx={{ mb: 4 }}>
      <Box 
        sx={{ 
          display: "flex", 
          alignItems: "center", 
          mb: 2,
          pb: 1,
          borderBottom: "1px dashed rgba(0,0,0,0.1)"
        }}
      >
        <Box sx={styles.statusIconContainer}>
          <StatusIcon status={status} />
        </Box>
        <Typography 
          variant="subtitle1" 
          fontWeight="bold"
          sx={{ color: STATUS_COLORS[status] || "#9e9e9e" }}
        >
          {status} {filteredOrders.length > 0 && `(${filteredOrders.length})`}
        </Typography>
      </Box>
      
      {filteredOrders.length > 0 ? (
        <List sx={{ width: '100%' }}>
          {filteredOrders.map(order => (
            <OrderItem key={order.id} order={order} />
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", pl: 2 }}>
          No {status.toLowerCase()} orders
        </Typography>
      )}
    </Box>
  );
});

const ProfilePage: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    address: "",
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch profile data from the API when the component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("http://localhost:8000/profile/", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error("Failed to fetch profile data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  // Handle input changes when editing profile using useCallback
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setIsEditing((prev) => !prev);
  }, []);

  // Save changes by sending updated data to the backend
  const handleSaveChanges = async () => {
    try {
      const response = await fetch("http://localhost:8000/profile/edit/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        const updatedData = await response.json();
        setUserData(updatedData);
        setIsEditing(false);
      } else {
        console.error("Failed to update profile:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Get user initials for avatar - memoized
  const userInitials = useMemo(
    () =>
      userData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
    [userData.name]
  );

  // Array of status types (this can be replaced with real data if available)
  const statusTypes = useMemo<string[]>(
    () => ["In Transit", "Processing", "Delivered", "Refunded"],
    []
  );

  // Profile information form
  const profileForm = useMemo(
    () => (
      <Fade in={true}>
        <Box component="form" sx={{ "& .MuiTextField-root": styles.textFieldStyles }}>
          <TextField
            label="Full Name"
            name="name"
            fullWidth
            variant="outlined"
            value={userData.name}
            onChange={handleInputChange}
          />
          <TextField
            label="Email"
            name="email"
            fullWidth
            variant="outlined"
            value={userData.email}
            onChange={handleInputChange}
          />
          <TextField
            label="Address"
            name="address"
            fullWidth
            variant="outlined"
            value={userData.address}
            onChange={handleInputChange}
          />
        </Box>
      </Fade>
    ),
    [userData, handleInputChange]
  );

  // Profile information view
  const profileInfo = useMemo(
    () => (
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={0}>
          <Grid item xs={3} sx={{ pr: 1 }}>
            <Typography color="text.secondary" variant="body1">
              Name:
            </Typography>
          </Grid>
          <Grid item xs={9}>
            <Typography fontWeight="medium" variant="body1">
              {userData.name}
            </Typography>
          </Grid>

          <Grid item xs={3} sx={{ pr: 1, mt: 1.5 }}>
            <Typography color="text.secondary" variant="body1">
              Email:
            </Typography>
          </Grid>
          <Grid item xs={9} sx={{ mt: 1.5 }}>
            <Typography fontWeight="medium" variant="body1">
              {userData.email}
            </Typography>
          </Grid>

          <Grid item xs={3} sx={{ pr: 1, mt: 1.5 }}>
            <Typography color="text.secondary" variant="body1">
              Address:
            </Typography>
          </Grid>
          <Grid item xs={9} sx={{ mt: 1.5 }}>
            <Typography fontWeight="medium" variant="body1">
              {userData.address}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    ),
    [userData]
  );

  if (loading) {
    return (
      <Container sx={{ mt: 12, minHeight: "80vh", mb: 8 }}>
        <Typography variant="h6" textAlign="center">
          Loading profile...
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 12, minHeight: "80vh", mb: 8 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        textAlign="center"
        sx={styles.headerText}
      >
        My Profile
      </Typography>

      {/* Profile Info */}
      <Fade in={true} timeout={800}>
        <Paper elevation={3} sx={{ ...styles.paperStyles, mt: 6, maxWidth: 600, mx: "auto" }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Avatar sx={styles.avatarStyles}>{userInitials}</Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {userData.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your personal information
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {isEditing ? profileForm : profileInfo}

          {/* Edit and Save Buttons */}
          <Box mt={4} display="flex" justifyContent="flex-end">
            {isEditing ? (
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                sx={styles.savedButton}
                onClick={handleSaveChanges}
              >
                Save Changes
              </Button>
            ) : (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                sx={styles.editButton}
                onClick={toggleEditMode}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </Paper>
      </Fade>

      {/* Order History */}
      <Fade in={true} timeout={1000}>
        <Paper elevation={3} sx={{ ...styles.paperStyles, mt: 6, maxWidth: 600, mx: "auto" }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Order History
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your recent purchases organized by status
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* Group orders by status */}
          {statusTypes.map((status) => (
            <OrderStatusSection key={status} status={status} orders={[]} />
          ))}
        </Paper>
      </Fade>
    </Container>
  );
};

export default React.memo(ProfilePage);