// src/pages/admin/ProfilePage.tsx
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
  ListItemText,
  keyframes,
  IconButton
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  DoneAll as DoneAllIcon,
} from "@mui/icons-material";
import RefundModal from "../components/RefundModal";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";   
const MotionPaper = motion(Paper);

// --- Types --- //
interface ProfileData {
  id: number;
  username: string;
  password: string;
  name: string;
  email: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city:        string;
  postalCode:  string;
}

interface Order {
  id: number;
  date: string;
  total: string;
  status: string;
  products: string;
  refund_status?: string;
  refund_updated_at?: string;
}

// --- Animations & Styled Components --- //
const truckLoopAnimation = keyframes`
  0% { transform: translateX(-20px); opacity: 0; }
  10% { transform: translateX(0); opacity: 1; }
  80% { transform: translateX(40px); opacity: 1; }
  100% { transform: translateX(60px); opacity: 0; }
`;

const titlePulse = keyframes`
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-4px); }
`;

const MovingTruck = styled(ShippingIcon)(({ theme }) => ({
  animation: `${truckLoopAnimation} 2s infinite`,
  color: "#2196f3",
}));

// --- Styles --- //
const styles = {
  headerText: {
    position: 'relative',
    background: 'linear-gradient(45deg, #FF7C3E 30%, #FF6B3E 70%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: `${titlePulse} 3s ease-in-out infinite`,
    '&:after': {
      content: '""',
      position: 'absolute',
      bottom: -10,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 90,
      height: 3,
      background: 'linear-gradient(90deg, #FF7C3E, #FFB473)',
      borderRadius: 4,
    },
  },
  paperStyles: {
    p: 4,
    borderRadius: "12px",
    transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
    "&:hover": {
      boxShadow:
        "rgba(255, 165, 89, 0.1) 0px 10px 20px, rgba(255, 165, 89, 0.20) 0px 6px 6px",
      transform: "translateY(-4px)",
    },
    borderLeft: "4px solid #EF977F",
  },
  avatarStyles: {
    width: 64,
    height: 64,
    background: "linear-gradient(45deg, #EF977F 30%, #FF7C3E 90%)",
    color: "white",
    marginRight: 2,
    fontSize: "1.5rem",
    fontWeight: "bold",
    boxShadow: "0 4px 8px rgba(255, 165, 89, 0.20)",
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
  "Delivered": "#4CAF50",
  "In Transit": "#2196f3",
  "Processing": "#ff9800",
  "Refunded": "#388e3c",            
  "Cancelled": "#FF6B3E",
  "Refund Approved": "#388e3c",
  "Refund Rejected": "#d32f2f",
};

// --- Status Icon ---
interface StatusIconProps { status: string; }
const StatusIcon: React.FC<StatusIconProps> = React.memo(({ status }) => {
  switch (status) {
    case "Delivered":      return <DoneAllIcon sx={{ color: STATUS_COLORS.Delivered }} />;
    case "In Transit":     return <MovingTruck />;
    case "Processing":     return <InventoryIcon sx={{ color: STATUS_COLORS.Processing }} />;
    case "Refunded":       return <CheckCircleIcon sx={{ color: STATUS_COLORS.Refunded }} />;
    case "Cancelled":      return <CancelIcon sx={{ color: STATUS_COLORS.Cancelled }} />;
    default:               return null;
  }
});

// --- Order Item ---
interface OrderItemProps {
  order: Order;
  setRefundModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedOrderId: React.Dispatch<React.SetStateAction<number | null>>;
}
const OrderItem: React.FC<OrderItemProps> = React.memo(({ order, setRefundModalOpen, setSelectedOrderId }) => (
  <>
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
          <Typography variant="body2" fontWeight="medium">
            Total: {order.total}
          </Typography>
          {order.status === "Delivered" && (
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={() => {
                setSelectedOrderId(order.id);
                setRefundModalOpen(true);
              }}
              sx={{ width: "fit-content", textTransform: "none" }}
            >
              Request Refund
            </Button>
          )}
          {order.status === "Processing" && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => {
              if (!window.confirm("Cancel this order?")) return;
              const token = localStorage.getItem("access_token");
              fetch(`http://127.0.0.1:8000/api/orders/${order.id}/status/`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  "X-CSRFToken": getCSRFToken(),
                  "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ status: "Cancelled" }),
              })
                .then((res) => {
                  if (!res.ok) throw new Error("Cannot cancel order");
                  return res.json();
                })
                .then(() => window.location.reload())
                .catch((err) => window.alert(err.message));
            }}
            sx={{ width: "fit-content", textTransform: "none" }}
          >
            Cancel Order
          </Button>
        )}
        </Box>
      }
    />
    <Divider sx={{ opacity: 0.4 }} />
  </>
));

// --- Order Status Section ---
interface OrderStatusSectionProps {
  status: string;
  orders: Order[];
  setRefundModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedOrderId: React.Dispatch<React.SetStateAction<number | null>>;
}
const OrderStatusSection: React.FC<OrderStatusSectionProps> = React.memo(({ status, orders, setRefundModalOpen, setSelectedOrderId }) => {
  const navigate = useNavigate();
  const filteredOrders = useMemo(() => orders.filter(order => order.status === status), [orders, status]);

  return (
    <Box sx={{ marginBottom: 4 }}>
      <Box sx={{
        display: "flex",
        alignItems: "center",
        marginBottom: 2,
        paddingBottom: 1,
        borderBottom: "1px dashed rgba(0,0,0,0.1)"
      }}>
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
            <OrderItem
              key={order.id}
              order={order}
              setRefundModalOpen={setRefundModalOpen}
              setSelectedOrderId={setSelectedOrderId}
            />
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

// --- Main Component ---
const ProfilePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const [profileData, setProfileData] = useState<ProfileData>({
    id: 0,
    username: "",
    password: "",
    name: "",
    email: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Refund notification state (unchanged)
  const [refundNotification, setRefundNotification] = useState<null | { status: string; orderId: number }>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?next=/profile", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Fetch profile data
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      const accessToken = localStorage.getItem("access_token");
      try {
        const res = await fetch("http://localhost:8000/profile/", {
          method: "GET",
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfileData({
            id:           data.id,
            username:     data.username,
            password:     "",
            name:         data.name         || "",
            email:        data.email        || "",
            phoneNumber:  data.phone_number || "",
            addressLine1: data.address_line1|| "",
            addressLine2: data.address_line2|| "",
            city:         data.city         || "",
            postalCode:   data.postal_code  || "",
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  }, []);

  const toggleEditMode = useCallback(() => setIsEditing(prev => !prev), []);

  const handleSaveChanges = async () => {
    const accessToken = localStorage.getItem("access_token");
    try {
      const res = await fetch("http://localhost:8000/profile/edit/", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "X-CSRFToken":    getCSRFToken(),
          "Authorization":  `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          name:          profileData.name,
          email:         profileData.email,
          phone_number:  profileData.phoneNumber,
          address_line1: profileData.addressLine1,
          address_line2: profileData.addressLine2,
          city:          profileData.city,
          postal_code:   profileData.postalCode,
          ...(profileData.password ? { password: profileData.password } : {}),
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfileData(prev => ({ ...prev, ...updated, password: "" }));
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const userInitials = useMemo(
    () => profileData.username.charAt(0).toUpperCase() || "U",
    [profileData.username]
  );

  // Orders fetch
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem("access_token");
    fetch("http://127.0.0.1:8000/api/orders/mine/", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : Promise.reject("Cannot load orders"))
      .then((data: any[]) => {
        const list = data.map(o => {
          const displayStatus = o.status === "Shipped" ? "In Transit" : o.status;
          return {
            id:    o.id,
            date:  new Date(o.created_at).toLocaleDateString(),
            total: `$${parseFloat(o.total as string).toFixed(2)}`,
            status: displayStatus,
            products: (o.items as any[])
              .map((i: any) => `${i.product_title} (x${i.quantity})`)
              .join(", "),
            refund_status:      o.refund_status,
            refund_updated_at:  o.refund_updated_at,
          };
        });
        setOrders(list);

        const recent = data.find(o =>
          o.refund_status &&
          new Date(o.refund_updated_at) > new Date(Date.now() - 1000 * 60 * 5)
        );
        if (recent) {
          setRefundNotification({ status: recent.refund_status, orderId: recent.id });
        }
      })
      .catch(console.error);
  }, [isAuthenticated]);

  if (loading) {
    return (
      <Container sx={{ mt:12, minHeight:"80vh" }}>
        <Typography variant="h6" textAlign="center">Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt:12, minHeight:"80vh", mb:8 }}>
      {refundNotification && (
        <Fade in>
          <Paper elevation={5} sx={{
            position: "fixed", top:90, right:30, zIndex:1200,
            px:3, py:2,
            background: refundNotification.status==="Approved"?"#e8f5e9":"#FFF3ED",
            borderLeft: `6px solid ${
              refundNotification.status==="Approved"
                ? STATUS_COLORS["Refund Approved"]
                : STATUS_COLORS["Refund Rejected"]
            }`,
            display:"flex", alignItems:"center", gap:2, minWidth:260
          }}>
            <InfoIcon sx={{
              color: refundNotification.status==="Approved"
                ? STATUS_COLORS["Refund Approved"]
                : STATUS_COLORS["Refund Rejected"]
            }}/>
            <Box flex={1}>
              <Typography fontWeight="bold">
                {refundNotification.status==="Approved"?"Refund Approved":"Refund Rejected"}
              </Typography>
              <Typography variant="body2">
                Order #{refundNotification.orderId} refund has been{" "}
                <strong style={{
                  color: refundNotification.status==="Approved"
                    ? STATUS_COLORS["Refund Approved"]
                    : STATUS_COLORS["Refund Rejected"]
                }}>
                  {refundNotification.status.toUpperCase()}
                </strong>
              </Typography>
            </Box>
            <IconButton onClick={() => setRefundNotification(null)}>
              <CloseIcon/>
            </IconButton>
          </Paper>
        </Fade>
      )}

      <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center" sx={styles.headerText}>
        My Profile
      </Typography>

      <Fade in timeout={800}>
        <Paper elevation={3} sx={{ ...styles.paperStyles, mt:6, maxWidth:600, mx:"auto" }}>
          <Box sx={{ display:"flex", alignItems:"center", mb:3 }}>
            <Avatar sx={styles.avatarStyles}>{userInitials}</Avatar>
            <Typography variant="h6" fontWeight="bold">
              {profileData.username}
            </Typography>
          </Box>
          <Divider sx={{ mb:3 }} />

          {isEditing ? (
            <Fade in>
              <Box component="form" sx={{ "& .MuiTextField-root": styles.textFieldStyles }}>
                <TextField label="Customer ID" name="id" fullWidth value={profileData.id} disabled />
                <TextField label="Username" name="username" fullWidth value={profileData.username} disabled />
                <TextField label="Full Name" name="name" fullWidth value={profileData.name} onChange={handleInputChange} />
                <TextField label="Email" name="email" fullWidth value={profileData.email} onChange={handleInputChange} />
                <TextField label="New Password" name="password" type="password" fullWidth value={profileData.password} onChange={handleInputChange} />
                <TextField label="Phone Number" name="phoneNumber" fullWidth value={profileData.phoneNumber} onChange={handleInputChange} />
                <TextField label="Address Line 1" name="addressLine1" fullWidth value={profileData.addressLine1} onChange={handleInputChange} />
                <TextField label="Address Line 2" name="addressLine2" fullWidth value={profileData.addressLine2} onChange={handleInputChange} />
                <TextField label="City" name="city" fullWidth value={profileData.city} onChange={handleInputChange} />
                <TextField label="Postal Code" name="postalCode" fullWidth value={profileData.postalCode} onChange={handleInputChange} />
              </Box>
            </Fade>
          ) : (
            <Box mb={3}>
              <Grid container spacing={1}>
                <Grid item xs={4}><Typography color="text.secondary">Customer ID:</Typography></Grid>
                <Grid item xs={8}><Typography fontWeight="medium">{profileData.id}</Typography></Grid>
                <Grid item xs={4}><Typography color="text.secondary">Username:</Typography></Grid>
                <Grid item xs={8}><Typography fontWeight="medium">{profileData.username}</Typography></Grid>
                <Grid item xs={4}><Typography color="text.secondary">Password:</Typography></Grid>
                <Grid item xs={8}><Typography fontWeight="medium">••••••••</Typography></Grid>
                <Grid item xs={4}><Typography color="text.secondary">Full Name:</Typography></Grid>
                <Grid item xs={8}><Typography fontWeight="medium">{profileData.name || "(NOT SET)"}</Typography></Grid>
                <Grid item xs={4}><Typography color="text.secondary">Email:</Typography></Grid>
                <Grid item xs={8}><Typography fontWeight="medium">{profileData.email}</Typography></Grid>
                <Grid item xs={4}><Typography color="text.secondary">Phone Number:</Typography></Grid>
                <Grid item xs={8}><Typography fontWeight="medium">{profileData.phoneNumber || "(NOT SET)"}</Typography></Grid>
                <Grid item xs={4}><Typography color="text.secondary">Address Line 1:</Typography></Grid>
                <Grid item xs={8}><Typography fontWeight="medium">{profileData.addressLine1 || "(NOT SET)"}</Typography></Grid>
                <Grid item xs={4}><Typography color="text.secondary">Address Line 2:</Typography></Grid>
                <Grid item xs={8}><Typography fontWeight="medium">{profileData.addressLine2 || "(NOT SET)"}</Typography></Grid>
                <Grid item xs={4}><Typography color="text.secondary">City:</Typography></Grid>
                <Grid item xs={8}><Typography fontWeight="medium">{profileData.city || "(NOT SET)"}</Typography></Grid>
                <Grid item xs={4}><Typography color="text.secondary">Postal Code:</Typography></Grid>
                <Grid item xs={8}><Typography fontWeight="medium">{profileData.postalCode || "(NOT SET)"}</Typography></Grid>
              </Grid>
            </Box>
          )}

          <Box mt={4} display="flex" justifyContent="flex-end">
            {isEditing ? (
              <Button variant="contained" startIcon={<SaveIcon />} sx={styles.savedButton} onClick={handleSaveChanges}>
                Save Changes
              </Button>
            ) : (
              <Button variant="outlined" startIcon={<EditIcon />} sx={styles.editButton} onClick={toggleEditMode}>
                Edit Profile
              </Button>
            )}
          </Box>
        </Paper>
      </Fade>

      <Fade in timeout={1000}>
        <Paper elevation={3} sx={{ ...styles.paperStyles, mt:6, maxWidth:600, mx:"auto" }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h6" fontWeight="bold">Order History</Typography>
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
                '&:hover': { background: 'linear-gradient(45deg, #f97316, #ea580c)', transform: 'scale(1.05)' },
                '&:active': { transform: 'scale(0.97)' },
              }}
              size="small"
            >
              View Transaction History
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb:3 }}>
            Your recent purchases organized by status
          </Typography>
          <Divider sx={{ mb:3 }} />
          {selectedOrderId !== null && (
            <RefundModal
              open={refundModalOpen}
              onClose={() => setRefundModalOpen(false)}
              orderId={selectedOrderId}
              accessToken={localStorage.getItem("access_token") || ""}
              onSuccess={() => window.location.reload()}
            />
          )}
          {["Processing","In Transit","Delivered","Refunded","Cancelled"].map(status => (
            <OrderStatusSection
              key={status}
              status={status}
              orders={orders}
              setRefundModalOpen={setRefundModalOpen}
              setSelectedOrderId={setSelectedOrderId}
            />
          ))}
        </Paper>
      </Fade>
    </Container>
  );
};

export default React.memo(ProfilePage);