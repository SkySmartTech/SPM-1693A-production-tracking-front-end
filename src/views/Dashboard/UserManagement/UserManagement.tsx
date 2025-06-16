import React, { useState } from "react";
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
  CircularProgress,
  Badge,
  useTheme
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Fullscreen as FullscreenIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";
import UserManagementTable from "./UserManagementTable";
import Sidebar from "../../../components/Sidebar";
import { Menu } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCustomTheme } from "../../../context/ThemeContext";
import { 
  User, 
  departments, 
  userTypes, 
  availabilityOptions, 
  statusOptions 
} from "../../../types/userManagementTypes";
import { 
  fetchUsers, 
  createUser, 
  updateUser, 
  deactivateUser 
} from "../../../api/userManagementApi";

const UserManagement: React.FC = () => {
  const [form, setForm] = useState<Omit<User, 'id'> & { id?: number }>({
    epf: "",
    employeeName: "",
    username: "",
    department: "",
    contact: "",
    email: "",
    userType: "",
    availability: false,
    password: "",
    password_confirmation: "",
    status: true
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationCount] = useState(3);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error"
  });
  const theme = useTheme();
  useCustomTheme();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch active users
  const { data: users = [], isLoading: isDataLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => fetchUsers().then(users => 
      users.filter(user => user.status === true)
    ),
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showSnackbar("User created successfully!", "success");
      handleClear();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to create user";
      const errors = error.response?.data?.errors;
      if (errors) {
        showSnackbar(Object.values(errors).flat().join(", "), "error");
      } else {
        showSnackbar(errorMessage, "error");
      }
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: (userData: User) => updateUser(userData.id as number, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showSnackbar("User updated successfully!", "success");
      handleClear();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to update user";
      const errors = error.response?.data?.errors;
      if (errors) {
        showSnackbar(Object.values(errors).flat().join(", "), "error");
      } else {
        showSnackbar(errorMessage, "error");
      }
    }
  });

  const deactivateUserMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showSnackbar("User deactivated successfully!", "success");
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || "Failed to deactivate user", "error");
    }
  });

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<{ value: unknown }>, field: keyof User) => {
    const value = e.target.value;
    if (field === 'status' || field === 'availability') {
      setForm(prev => ({
        ...prev,
        [field]: value === 'true' || value === true
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = () => {
    if (!form.epf || !form.employeeName || !form.username || 
        (editId === null && (!form.password || !form.password_confirmation))) {
      showSnackbar("Please fill all required fields!", "error");
      return;
    }

    if (editId === null && form.password !== form.password_confirmation) {
      showSnackbar("Password and confirmation do not match!", "error");
      return;
    }

    const userData = {
      ...form,
      status: form.status
    };

    if (editId !== null) {
      updateUserMutation.mutate({ ...userData, id: editId });
    } else {
      createUserMutation.mutate(userData as User);
    }
  };

  const handleClear = () => {
    setForm({
      epf: "",
      employeeName: "",
      username: "",
      department: "",
      contact: "",
      email: "",
      userType: "",
      availability: false,
      password: "",
      password_confirmation: "",
      status: true
    });
    setEditId(null);
  };

  const handleEdit = (id: number) => {
    const userToEdit = users.find(user => user.id === id);
    if (userToEdit) {
      setForm({
        ...userToEdit,
        password: "",
        password_confirmation: ""
      });
      setEditId(id);
    }
  };

  const handleDeactivate = (id: number) => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      deactivateUserMutation.mutate(id);
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

  const isMutating = createUserMutation.isPending || 
                     updateUserMutation.isPending || 
                     deactivateUserMutation.isPending;

  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar open={sidebarOpen || hovered} setOpen={setSidebarOpen} />
      
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AppBar position="static" sx={{ bgcolor: theme.palette.background.paper, boxShadow: 2 }}>
          <Toolbar>
            <IconButton edge="start" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, color: theme.palette.text.primary }}>
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
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ '& .MuiPaper-root': { width: 300, maxHeight: 400 } }}
              >
                <MenuItem disabled>
                  <Typography variant="body2">You have {notificationCount} new notifications</Typography>
                </MenuItem>
                <Divider />
                <MenuItem><Typography variant="body2">Notification 1</Typography></MenuItem>
                <MenuItem><Typography variant="body2">Notification 2</Typography></MenuItem>
                <Divider />
                <MenuItem onClick={handleViewAllNotifications}>
                  <Button fullWidth variant="contained" size="small">
                    View All Notifications
                  </Button>
                </MenuItem>
              </Menu>

              <IconButton onClick={() => document.fullscreenElement ? 
                document.exitFullscreen() : document.documentElement.requestFullscreen()}>
                <FullscreenIcon />
              </IconButton>

              <IconButton onClick={handleAccountMenuOpen}>
                <AccountCircleIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleAccountMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={handleProfileClick}>User Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Stack spacing={3} sx={{ p: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              User Details
            </Typography>

            <Stack spacing={2}>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <TextField
                  label="EPF*"
                  name="epf"
                  value={form.epf}
                  onChange={handleChange}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                />
                <TextField
                  label="Employee Name*"
                  name="employeeName"
                  value={form.employeeName}
                  onChange={handleChange}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                />
                <TextField
                  label="Username*"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                />
                {editId === null && (
                  <>
                    <TextField
                      label="Password*"
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                    />
                    <TextField
                      label="Confirm Password*"
                      name="password_confirmation"
                      type="password"
                      value={form.password_confirmation}
                      onChange={handleChange}
                      sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                    />
                  </>
                )}
                <TextField
                  select
                  label="Department"
                  name="department"
                  value={form.department}
                  onChange={(e) => handleSelectChange(e, "department")}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Contact"
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                />
                <TextField
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                />
                <TextField
                  select
                  label="User Type"
                  name="userType"
                  value={form.userType}
                  onChange={(e) => handleSelectChange(e, "userType")}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                >
                  {userTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Availability"
                  name="availability"
                  value={form.availability.toString()}
                  onChange={(e) => handleSelectChange(e, "availability")}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                >
                  {availabilityOptions.map((option) => (
                    <MenuItem key={option.label} value={option.value.toString()}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Status"
                  name="status"
                  value={form.status.toString()}
                  onChange={(e) => handleSelectChange(e, "status")}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.label} value={option.value.toString()}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={isMutating}
                  startIcon={isMutating ? <CircularProgress size={20} /> : null}
                >
                  {editId !== null ? "Update User" : "Create User"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClear}
                  disabled={isMutating}
                >
                  Clear
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <UserManagementTable
            users={users}
            handleEdit={handleEdit}
            handleDelete={handleDeactivate}
            loading={isDataLoading || isMutating}
          />
        </Stack>

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
    </Box>
  );
};

export default UserManagement;