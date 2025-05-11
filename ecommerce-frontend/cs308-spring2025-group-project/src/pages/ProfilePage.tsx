import React, { useState, useCallback, useMemo, useEffect } from "react";
import { getCSRFToken, useAuth } from "../context/AuthContext";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Grid,
  Divider,
  Avatar,
  Fade,
  List,
  ListItem,
  ListItemText,
  keyframes,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

// --- Types --- //
interface ProfileData {
  username: string; // from request.user.username
  name: string;     // full name stored in Profile (can be empty)
  email: string;
  address: string;
}

interface Order {
  id: number;
  date: string;
  total: string;
  status: string;
  products: string;
}

// --- Animations & Styled Components --- //
const truckLoopAnimation = keyframes`
  0% { transform: translateX(-20px); opacity: 0; }
  10% { transform: translateX(0); opacity: 1; }
  80% { transform: translateX(40px); opacity: 1; }
  100% { transform: translateX(60px); opacity: 0; }
`;

const MovingTruck = styled(ShippingIcon)(({ theme }) => ({
  animation: `${truckLoopAnimation} 2s infinite`,
  color: "#2196f3",
}));

// --- Styles --- //
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
    },
  },
  paperStyles: {
    p: 4,
    borderRadius: "12px",
    transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
    "&:hover": {
      boxShadow:
        "rgba(239, 151, 127, 0.1) 0px 10px 20px, rgba(239, 151, 127, 0.08) 0px 6px 6px",
      transform: "translateY(-4px)",
    },
    borderLeft: "4px solid #EF977F",
  },
  avatarStyles: {
    width: 64,
    height: 64,
    background: "linear-gradient(45deg, #EF977F 30%, #d46c4e 90%)",
    color: "white",
    marginRight: 2,
    fontSize: "1.5rem",
    fontWeight: "bold",
    boxShadow: "0 4px 8px rgba(239, 151, 127, 0.3)",
  },
  savedButton: {
    background: "linear-gradient(45deg, #EF977F 30%, #d46c4e 90%)",
    "&:hover": {
      background: "linear-gradient(45deg, #d46c4e 30%, #c05c3e 90%)",
    },
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(239, 151, 127, 0.3)",
    paddingX: 3,
    paddingY: 1,
  },
  editButton: {
    borderColor: "#EF977F",
    color: "#EF977F",
    "&:hover": {
      borderColor: "#d46c4e",
      backgroundColor: "rgba(239, 151, 127, 0.20)",
    },
    borderRadius: "8px",
    paddingX: 3,
    paddingY: 1,
  },
  textFieldStyles: {
    marginBottom: 3,
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": {
        borderColor: "#EF977F",
      },
      "&:hover fieldset": {
        borderColor: "#f5b39e",
      },
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#EF977F",
    },
  },
};

const STATUS_COLORS: Record<string, string> = {
  Delivered: "#4caf50",
  "In Transit": "#2196f3",
  Processing: "#ff9800",
  Refunded: "#9e9e9e",
  Cancelled: "#f44336"
};

interface StatusIconProps {
  status: string;
}

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
    case "Cancelled":
      return <CancelIcon sx={{ color: STATUS_COLORS.Cancelled }} />;
      default:
      return null;
  }
});

interface OrderItemProps {
  order: Order;
}

const OrderItem: React.FC<OrderItemProps> = React.memo(({ order }) => (
  <>
    <ListItem
      alignItems="flex-start"
      sx={{
        paddingY: 2,
        transition: "all 0.2s ease",
        "&:hover": { backgroundColor: "rgba(0,0,0,0.03)", borderRadius: "8px" },
      }}
    >
      <ListItemText
        primary={
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body1" fontWeight="medium">
              {order.products || `Order #${order.id}`}
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
            sx={{ display: "block", fontWeight: "medium", marginTop: 0.5 }}
          >
            Total: {order.total}
          </Typography>
        }
      />
    </ListItem>
    <Divider sx={{ opacity: 0.4 }} />
  </>
));

interface OrderStatusSectionProps {
  status: string;
  orders: Order[];
}

const OrderStatusSection: React.FC<OrderStatusSectionProps> = React.memo(({ status, orders }) => {
  const navigate = useNavigate();
  const filteredOrders = useMemo(() => orders.filter(order => order.status === status), [orders, status]);
  return (
    <Box sx={{ marginBottom: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2, paddingBottom: 1, borderBottom: "1px dashed rgba(0,0,0,0.1)" }}>
        <Box sx={{ marginRight: 1, width: "30px", position: "relative", overflow: "hidden" }}>
          <StatusIcon status={status} />
        </Box>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: STATUS_COLORS[status] || "#9e9e9e" }}>
          {status} {filteredOrders.length > 0 && `(${filteredOrders.length})`}
        </Typography>
        {status === 'Refunded' && (
          <Button
          variant="outlined"
          size="small"
          onClick={() => navigate("/profile/refunds")}
          sx={{ ml: 2 }}
          >
          View All Refunds in Detail
          </Button>
         )}  
      </Box>
      {filteredOrders.length > 0 ? (
        <List sx={{ width: "100%" }}>
          {filteredOrders.map(order => (
            <OrderItem key={order.id} order={order} />
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", paddingLeft: 2 }}>
          No {status.toLowerCase()} orders
        </Typography>
      )}
    </Box>
  );
});

// --- Profile Page Component --- //
const ProfilePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Call hooks unconditionally
  const [profileData, setProfileData] = useState<ProfileData>({
    username: "",
    name: "",
    email: "",
    address: "",
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Redirect in an effect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?next=/profile", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Fetch profile data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchProfileData = async () => {
        const accessToken = localStorage.getItem("access_token");
        try {
          const response = await fetch("http://localhost:8000/profile/", {
            method: "GET",
            credentials: "include",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setProfileData(data);
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
    }
  }, [isAuthenticated]);

  // Handle input changes when editing profile
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setIsEditing((prev) => !prev);
  }, []);

  // Save changes to profile
  const handleSaveChanges = async () => {
    const accessToken = localStorage.getItem("access_token");
    try {
      const response = await fetch("http://localhost:8000/profile/edit/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
          "Authorization": `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          address: profileData.address,
        }),
      });
      if (response.ok) {
        const updatedData = await response.json();
        setProfileData((prev) => ({ ...prev, ...updatedData }));
        setIsEditing(false);
      } else {
        console.error("Failed to update profile:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Compute initials for the Avatar from username
  const userInitials = useMemo(() => {
    return profileData.username ? profileData.username.charAt(0).toUpperCase() : "U";
  }, [profileData.username]);

  // ─────────── Real order-history state & fetch ───────────
const [orders, setOrders]               = useState<Order[]>([]);
const [loadingOrders, setLoadingOrders] = useState<boolean>(true);

const statusTypes = useMemo<string[]>(() =>
  ["Processing", "In Transit", "Delivered", "Refunded", "Cancelled"],
  []
);

useEffect(() => {
  if (!isAuthenticated) return;
  const token = localStorage.getItem("access_token");
  fetch("http://127.0.0.1:8000/api/orders/mine/", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Cannot load orders");
      return res.json();
    })
    .then((data: any[]) =>
      setOrders(
        data.map((o) => ({
          id:       o.id,
          date:     new Date(o.created_at).toLocaleDateString(),
          total:    `$${parseFloat(o.total as string).toFixed(2)}`,
          status:   o.status === "Shipped" ? "In Transit" : o.status,
          products: (o.items as any[])
            .map(i => `${i.product_title} (x${i.quantity})`)
            .join(", "),
        }))
      )
    )
    .catch(console.error)
    .finally(() => setLoadingOrders(false));
}, [isAuthenticated]);

  if (loading) {
    return (
      <Container sx={{ marginTop: 12, minHeight: "80vh", marginBottom: 8 }}>
        <Typography variant="h6" textAlign="center">
          Loading profile...
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ marginTop: 12, minHeight: "80vh", marginBottom: 8 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        textAlign="center"
        sx={styles.headerText}
      >
        My Profile
      </Typography>

      <Fade in={true} timeout={800}>
        <Paper elevation={3} sx={{ ...styles.paperStyles, marginTop: 6, maxWidth: 600, marginX: "auto" }}>
          <Box sx={{ display: "flex", alignItems: "center", marginBottom: 3 }}>
            <Avatar sx={styles.avatarStyles}>{userInitials}</Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {profileData.username}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ marginBottom: 3 }} />

          {isEditing ? (
            <Fade in={true}>
              <Box component="form" sx={{ "& .MuiTextField-root": styles.textFieldStyles }}>
                {/* Username displayed as read-only */}
                <TextField
                  label="Username"
                  name="username"
                  fullWidth
                  variant="outlined"
                  value={profileData.username}
                  disabled
                />
                {/* Full Name field: initially blank if not set */}
                <TextField
                  label="Full Name"
                  name="name"
                  fullWidth
                  variant="outlined"
                  placeholder="Enter your full name"
                  value={profileData.name}
                  onChange={handleInputChange}
                />
                <TextField
                  label="Email"
                  name="email"
                  fullWidth
                  variant="outlined"
                  value={profileData.email}
                  onChange={handleInputChange}
                />
                <TextField
                  label="Address"
                  name="address"
                  fullWidth
                  variant="outlined"
                  value={profileData.address}
                  onChange={handleInputChange}
                />
              </Box>
            </Fade>
          ) : (
            <Box sx={{ marginBottom: 3 }}>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Typography color="text.secondary" variant="body1">
                    Username:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography fontWeight="medium" variant="body1">
                    {profileData.username}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography color="text.secondary" variant="body1">
                    Full Name:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography fontWeight="medium" variant="body1">
                    {profileData.name || "(NOT SET)"}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography color="text.secondary" variant="body1">
                    Email:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography fontWeight="medium" variant="body1">
                    {profileData.email}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography color="text.secondary" variant="body1">
                    Address:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography fontWeight="medium" variant="body1">
                    {profileData.address || "(NOT SET)"}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}

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

      {/* Order History Section */}
      <Fade in={true} timeout={1000}>
        <Paper elevation={3} sx={{ ...styles.paperStyles, marginTop: 6, maxWidth: 600, marginX: "auto" }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
        >
          <Typography variant="h6" fontWeight="bold">
            Order History
          </Typography>
          <Button
            onClick={() => navigate("/profile/transactions")}
            sx={{
              background: 'linear-gradient(45deg, #f6ad55, #f97316)',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: 3,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(45deg, #f97316, #ea580c)',
                transform: 'scale(1.05)',
              },
              '&:active': {
                transform: 'scale(0.97)',
              },
            }}
            size="small"
          >
            View Transaction History
          </Button>
        </Box>
          <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 3 }}>
            Your recent purchases organized by status
          </Typography>
          <Divider sx={{ marginBottom: 3 }} />
          {statusTypes.map((status) => (
            <OrderStatusSection key={status} status={status} orders={orders} />
          ))}
        </Paper>
      </Fade>
    </Container>
  );
};

export default React.memo(ProfilePage);