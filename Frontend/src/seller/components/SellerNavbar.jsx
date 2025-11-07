import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useSellerAuth } from "../context/SellerAuthContext";
import logo from "../../assets/UrbanTales.png";
import {
  AppBar, Toolbar, Button, Avatar, Chip, Box, Menu, MenuItem, Tooltip, useMediaQuery
} from "@mui/material";
import { Logout, AccountCircle, Menu as MenuIcon } from "@mui/icons-material";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SellerNotificationDrawer from "./SellerNotificationDrawer";
import { motion } from "framer-motion";

// Seller panel nav items
const NAV = [
  { label: "Dashboard", href: "/seller/dashboard" },
  { label: "Products", href: "/seller/products" },
  { label: "Add Product", href: "/seller/add-product" },
  { label: "Orders", href: "/seller/orders" },
  { label: "Earnings", href: "/seller/earnings" },
  { label: "Profile", href: "/seller/profile" }
];

export default function SellerNavbar() {
  const { seller, logout } = useSellerAuth();
  const notificationsCount = seller?.notificationsCount ?? 0;
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:900px)');

  // Secure logout handler
  const handleSellerLogout = () => {
    logout();
    navigate("/sellerlogin");
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={5}
        sx={{
          background: 'linear-gradient(90deg,#f8f6fc 40%, #e2e2fa 100%)',
          borderBottom: "1px solid #e2e2fa"
        }}
      >
        <Toolbar
          sx={{
            minHeight: 64, px: { xs: 2, sm: 7 },
            display: 'flex', alignItems: 'center',
            backdropFilter: "blur(10px)"
          }}
        >
          {/* Logo */}
          <img
            src={logo}
            alt="UrbanTales"
            className="h-12 cursor-pointer"
            style={{ height: 48, marginRight: 18 }}
            onClick={() => navigate("/seller/dashboard")}
          />

          {/* Hamburger menu (mobile) */}
          {isMobile && (
            <>
              <Button sx={{ ml: 1, minWidth: 0 }} onClick={() => setMobileNavOpen(v => !v)}>
                <MenuIcon sx={{ color: "#5c27fe" }} fontSize="large" />
              </Button>
              {mobileNavOpen && (
                <Box
                  sx={{
                    position: "absolute", top: 64, left: 0, right: 0, bgcolor: "#fff",
                    zIndex: 999, boxShadow: 2, borderBottomLeftRadius: 8, borderBottomRightRadius: 8
                  }}
                >
                  {NAV.map(({ label, href }) => (
                    <NavLink
                      key={label}
                      to={href}
                      style={({ isActive }) => ({
                        display: "block",
                        color: isActive ? "#5c27fe" : "#440077",
                        background: isActive ? "#FFCC00" : "transparent",
                        fontWeight: 600,
                        padding: "14px 18px",
                        textDecoration: "none",
                        transition: "all .2s",
                        fontSize: 18
                      })}
                      onClick={() => setMobileNavOpen(false)}
                    >
                      {label}
                    </NavLink>
                  ))}
                </Box>
              )}
            </>
          )}

          {/* Desktop NAV links */}
          <Box sx={{
            flexGrow: 1, display: isMobile ? "none" : "flex",
            alignItems: "center", gap: 2
          }}>
            {NAV.map(({ label, href }) => (
              <NavLink
                key={label}
                to={href}
                style={({ isActive }) => ({
                  color: isActive ? "#5c27fe" : "#440077",
                  background: isActive ? "#FFCC00" : "transparent",
                  borderRadius: 6,
                  fontWeight: 600,
                  padding: "7px 19px",
                  textDecoration: "none",
                  fontSize: 16,
                  transition: "all .22s cubic-bezier(.61,1.42,.48,.89)",
                  boxShadow: isActive ? "0 0 16px #ffcc0044" : ""
                })}
              >
                {label}
              </NavLink>
            ))}
          </Box>

          {/* Bell + Notification Drawer */}
          <Box sx={{ ml: 1, display: "flex", alignItems: "center" }}>
            <motion.div
              whileHover={{ scale: 1.13 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 360, damping: 15 }}
              style={{
                display: "flex",
                alignItems: "center",
                background: "#fff",
                borderRadius: 20,
                width: 40,
                height: 28,
                justifyContent: "center",
                marginRight: 8,
                cursor: "pointer",
                boxShadow: "0 2px 12px #f8e2fa44",
                border: "none",
                padding: 0,
                position: "relative"
              }}
              onClick={() => setNotifOpen(true)}
              tabIndex={0}
              aria-label="Seller Notifications"
            >
              <NotificationsNoneIcon sx={{ color: "#FFD600", fontSize: 23 }} />
              {notificationsCount > 0 && (
                <span
                  style={{
                    background: "#F43F5E",
                    color: "#fff",
                    borderRadius: 999,
                    position: "absolute",
                    top: -9,
                    right: -6,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 5px"
                  }}
                >
                  {notificationsCount}
                </span>
              )}
            </motion.div>
          
          </Box>

          {/* Seller Info & Profile Menu */}
          {seller && (
            <>
              <Tooltip title={seller.fullName || seller.email}>
                <Avatar
                  sx={{ bgcolor: "#5c27fe", color: "#fff", ml: 1, mr: 1, cursor: "pointer" }}
                  onClick={handleMenu}
                  src={seller.avatar || ""}
                >
                  {seller.fullName ? seller.fullName.charAt(0) : "S"}
                </Avatar>
              </Tooltip>
              <Chip
                label={seller.fullName?.split(" ")[0] || seller.email}
                sx={{ bgcolor: "#FFCC00", color: "#440077", fontWeight: 700, fontSize: 15, ml: 1 }}
              />
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{ mt: 2 }}
              >
                <MenuItem onClick={() => { navigate("/seller/profile"); handleClose(); }}>
                  <AccountCircle sx={{ mr: 1 }} /> Profile
                </MenuItem>
                <MenuItem onClick={() => { handleSellerLogout(); handleClose(); }}>
                  <Logout sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </>
          )}

          {/* Logout */}
          {!Boolean(anchorEl) && (
            <Button
              onClick={handleSellerLogout}
              startIcon={<Logout />}
              sx={{
                ml: 1,
                bgcolor: "#F43F5E",
                color: "#fff",
                borderRadius: 2,
                fontWeight: 700,
                display: isMobile ? "none" : "flex",
                '&:hover': { bgcolor: "#FFCC00", color: "#440077" }
              }}
            >
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
}
