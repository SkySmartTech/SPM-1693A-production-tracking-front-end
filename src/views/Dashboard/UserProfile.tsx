import React, { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Avatar,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  CssBaseline,
  Divider,
  CircularProgress,
  Snackbar,
  Alert
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Fullscreen as FullscreenIcon,
  AccountCircle as AccountCircleIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import Sidebar from "../../components/Sidebar";
import { motion } from "framer-motion";
import { Menu, Badge } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Department options
const departments = ["IT", "HR", "Finance", "Marketing", "Operations"];

interface User {
  name: string;
  username: string;
  password: string;
  email: string;
  id: string;
  department: string;
  contact: string;
  photo: string;
}

const defaultUser: User = {
  name: "",
  username: "",
  password: "********",
  email: "",
  id: "",
  department: "",
  contact: "",
  photo: "",
};

const UserProfile: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationCount] = useState(3);
  const navigate = useNavigate();
  const [openPhoto, setOpenPhoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User>(defaultUser);
  const [editUser, setEditUser] = useState<User>(defaultUser);
  const [, setImagePreview] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await axios.get("http://localhost:8000/api/user/profile");
        setUser(response.data);
        setEditUser(response.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        // Use default empty values if API fails
        setUser(defaultUser);
        setEditUser(defaultUser);
        showSnackbar("Failed to load user data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  // Toggle fullscreen mode

  // Account menu handlers
  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate("/userProfile");
    handleAccountMenuClose();
  };

  const handleLogout = () => {
    // Clear user session before logout
    localStorage.removeItem("authToken");
    navigate("/login");
    handleAccountMenuClose();
  };

  // Notifications menu handlers
  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleViewAllNotifications = () => {
    navigate("/notifications");
    handleNotificationMenuClose();
  };

  // Handle edit form change
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditUser({ ...editUser, [name]: value });
  };

  // Validate form inputs
  const validateForm = () => {
    if (!/^[a-zA-Z0-9]+$/.test(editUser.username)) {
      showSnackbar("Username should not contain symbols!", "error");
      return false;
    }
    if (!/^\+?[0-9]+$/.test(editUser.contact)) {
      showSnackbar("Contact number must contain only numbers!", "error");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(editUser.email)) {
      showSnackbar("Please enter a valid email address", "error");
      return false;
    }
    return true;
  };

  // Save updated user info
  const handleSaveEdit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await axios.put("http://localhost:8000/api/user/profile", editUser);
      setUser(response.data);
      setEditUser(response.data);
      setOpenEdit(false);
      showSnackbar("Profile updated successfully!", "success");
    } catch (err) {
      console.error("Error updating profile:", err);
      showSnackbar("Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setLoading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("photo", file);

        // Replace with your actual API endpoint
        const response = await axios.post(
          "http://localhost:8000/api/user/photo",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setUser({ ...user, photo: response.data.photoUrl });
        setImagePreview(response.data.photoUrl);
        showSnackbar("Photo uploaded successfully!", "success");
      } catch (err) {
        console.error("Error uploading photo:", err);
        showSnackbar("Failed to upload photo", "error");
      } finally {
        setLoading(false);
        setOpenPhoto(false);
      }
    }
  };

  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh", minHeight: "100vh"}}>
      <CssBaseline />
      <Sidebar
        open={sidebarOpen || hovered}
        setOpen={setSidebarOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AppBar position="static" sx={{ bgcolor: "white", boxShadow: 2 }}>
          <Toolbar>
            <IconButton edge="start" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, color: "black" }}>
              User Profile
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton onClick={handleNotificationMenuOpen}>
                <Badge badgeContent={notificationCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <Menu
                anchorEl={notificationAnchorEl}
                open={Boolean(notificationAnchorEl)}
                onClose={handleNotificationMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                sx={{
                  '& .MuiPaper-root': {
                    width: 300,
                    maxHeight: 400
                  }
                }}
              >
                <MenuItem disabled>
                  <Typography variant="body2">You have {notificationCount} new notifications</Typography>
                </MenuItem>
                <Divider />
                <MenuItem>
                  <Typography variant="body2">Notification 1</Typography>
                </MenuItem>
                <MenuItem>
                  <Typography variant="body2">Notification 2</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleViewAllNotifications}>
                  <Button fullWidth variant="contained" size="small">
                    View All Notifications
                  </Button>
                </MenuItem>
              </Menu>

              <IconButton onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()}>
                <FullscreenIcon />
              </IconButton>

              <IconButton onClick={handleAccountMenuOpen}>
                <AccountCircleIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleAccountMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleProfileClick}>User Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Profile Card - Always visible */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Box sx={{
            bgcolor: "white",
            p: 4,
            borderRadius: 3,
            boxShadow: 3,
            maxWidth: 800,
            mx: "auto",
          }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress size={40} />
              </Box>
            ) : (
              <>
                {/* Profile Photo */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                  <Avatar
                    src={user.photo || "/default-avatar.png"}
                    sx={{ width: 100, height: 100 }}
                  />
                  <Button 
                    variant="outlined" 
                    onClick={() => setOpenPhoto(true)}
                    disabled={loading}
                  >
                    Change photo
                  </Button>
                </Box>

                {/* User Info - Always shows labels even if values are empty */}
                <Typography variant="h6" sx={{ mb: 2 }}>User Info</Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <Typography><b>Name:</b> {user.name || "-"}</Typography>
                  <Typography><b>Username:</b> {user.username || "-"}</Typography>
                  <Typography><b>Password:</b> {user.password.replace(/./g, "*")}</Typography>
                  <Typography><b>Email:</b> {user.email || "-"}</Typography>
                  <Typography><b>ID:</b> {user.id || "-"}</Typography>
                  <Typography><b>Department:</b> {user.department || "-"}</Typography>
                  <Typography><b>Contact:</b> {user.contact || "-"}</Typography>
                </Box>

                {/* Edit Button */}
                <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    sx={{ bgcolor: "primary.main" }}
                    onClick={() => setOpenEdit(true)}
                    disabled={loading}
                  >
                    Edit
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </motion.div>

        {/* Edit User Dialog */}
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
          <DialogTitle>Edit User Info</DialogTitle>
          <DialogContent>
            <TextField 
              fullWidth 
              label="Name" 
              name="name" 
              value={editUser.name} 
              onChange={handleEditChange} 
              sx={{ mb: 2 }} 
            />
            <TextField 
              fullWidth 
              label="Username" 
              name="username" 
              value={editUser.username} 
              onChange={handleEditChange} 
              sx={{ mb: 2 }} 
            />
            <TextField 
              fullWidth 
              label="Email" 
              name="email" 
              value={editUser.email} 
              onChange={handleEditChange} 
              sx={{ mb: 2 }} 
            />
            <TextField 
              fullWidth 
              label="Contact" 
              name="contact" 
              value={editUser.contact} 
              onChange={handleEditChange} 
              sx={{ mb: 2 }} 
            />
            <TextField 
              select 
              fullWidth 
              label="Department" 
              name="department" 
              value={editUser.department} 
              onChange={handleEditChange} 
              sx={{ mb: 2 }}
            >
              {departments.map((dept) => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveEdit} 
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Photo Upload Dialog */}
        <Dialog open={openPhoto} onClose={() => setOpenPhoto(false)}>
          <DialogTitle>Upload New Photo</DialogTitle>
          <DialogContent>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
              disabled={loading}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPhoto(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
      

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
  
    </Box>
  );
};

export default UserProfile;