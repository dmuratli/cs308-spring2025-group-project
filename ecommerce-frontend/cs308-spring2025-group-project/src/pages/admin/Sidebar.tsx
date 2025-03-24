import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import { useNavigate } from "react-router-dom";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin" },
    { text: "Manage Products", icon: <InventoryIcon />, path: "/admin/products" },
    { text: "Manage Orders", icon: <ShoppingCartIcon />, path: "/admin/orders" },
    { text: "Manage Users", icon: <PeopleIcon />, path: "/admin/users" },
  ];

  return (
    <Drawer variant="permanent" sx={{ width: 240, flexShrink: 0 }}>
      <Box sx={{ p: 2, textAlign: "center", backgroundColor: "#EF977F", color: "white" }}>
        <Typography variant="h6" fontWeight="bold">
          Admin Panel
        </Typography>
      </Box>
      <List>
        {menuItems.map((item, index) => (
          <ListItem component="li" key={index} onClick={() => navigate(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
