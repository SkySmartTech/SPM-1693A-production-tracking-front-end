import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Stack,
  AppBar,
  Toolbar,
  IconButton,
  CssBaseline,
  Divider,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Fullscreen as FullscreenIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";
import UserManagementTable from "./UserManagementTable";
import Sidebar from "../../../components/Sidebar";
import { Menu, Badge } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface User {
  id: number;
  epf: string;
  employeeName: string;
  username: string;
  password: string;
  department: string;
  contact: string;
  email: string;
  userType: string;
  availability: string;
}

const departments = ["IT", "HR", "Finance", "Marketing", "Operations"];
const userTypes = ["Admin", "User", "Manager"];
const availabilityStatus = ["Active", "Inactive"];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<User>({
    id: 0,
    epf: "",
    employeeName: "",
    username: "",
    password: "",
    department: "",
    contact: "",
    email: "",
    userType: "",
    availability: "",
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error"
  });
  const navigate = useNavigate();

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/users");
        setUsers(response.data.data);
      } catch (error) {
        showSnackbar("Failed to fetch users", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: React.ChangeEvent<{ value: unknown }>, field: keyof User) => {
    setForm({ ...form, [field]: e.target.value as string });
  };

  const handleSave = async () => {
    if (!form.epf || !form.employeeName || !form.username || !form.password) {
      showSnackbar("Please fill all required fields!", "error");
      return;
    }

    try {
      setLoading(true);
      if (editId !== null) {
        // Update existing user
        await axios.put(`/api/users/${editId}`, form);
        showSnackbar("User updated successfully!", "success");
      } else {
        // Create new user
        await axios.post("/api/users", form);
        showSnackbar("User created successfully!", "success");
      }
      // Refresh user list
      const response = await axios.get("/api/users");
      setUsers(response.data.data);
      handleClear();
    } catch (error) {
      showSnackbar("Failed to save user", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm({
      id: 0,
      epf: "",
      employeeName: "",
      username: "",
      password: "",
      department: "",
      contact: "",
      email: "",
      userType: "",
      availability: "",
    });
    setEditId(null);
  };

  const handleEdit = (id: number) => {
    const userToEdit = users.find(user => user.id === id);
    if (userToEdit) {
      setForm(userToEdit);
      setEditId(id);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await axios.delete(`/api/users/${id}`);
      setUsers(users.filter(user => user.id !== id));
      showSnackbar("User deleted successfully!", "success");
    } catch (error) {
      showSnackbar("Failed to delete user", "error");
    } finally {
      setLoading(false);
    }
  };


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

  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh", minHeight: "100vh" }}>
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
              User Management
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

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Stack spacing={3} sx={{ mt: 3 }}>
            <Paper sx={{ p: 1.4 }}>
              <Typography variant="h6" sx={{ mb: 0 }}>
                User Details
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <TextField fullWidth label="ID" name="id" value={form.id} disabled />
                <TextField fullWidth label="EPF*" name="epf" value={form.epf} onChange={handleChange} />
                <TextField fullWidth label="Employee Name*" name="employeeName" value={form.employeeName} onChange={handleChange} />
                <TextField fullWidth label="Username*" name="username" value={form.username} onChange={handleChange} />
                <TextField fullWidth label="Password*" name="password" type="password" value={form.password} onChange={handleChange} />
                <TextField
                  select
                  fullWidth
                  label="Department"
                  value={form.department}
                  onChange={(e) => handleSelectChange(e, "department")}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField fullWidth label="Contact" name="contact" value={form.contact} onChange={handleChange} />
                <TextField fullWidth label="Email" name="email" value={form.email} onChange={handleChange} />
                <TextField
                  select
                  fullWidth
                  label="User Type"
                  value={form.userType}
                  onChange={(e) => handleSelectChange(e, "userType")}
                >
                  {userTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  fullWidth
                  label="Availability"
                  value={form.availability}
                  onChange={(e) => handleSelectChange(e, "availability")}
                >
                  {availabilityStatus.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: "flex-end", p: 2 }}>
                <Button variant="contained" color="primary" onClick={handleSave} disabled={loading}>
                  {editId !== null ? "Update" : "Save"}
                </Button>
                <Button variant="outlined" onClick={handleClear} disabled={loading}>
                  Clear
                </Button>
              </Stack>
            </Paper>

            <UserManagementTable users={users} handleEdit={handleEdit} handleDelete={handleDelete} />
          </Stack>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
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
    </Box>
  );
};

export default UserManagement;