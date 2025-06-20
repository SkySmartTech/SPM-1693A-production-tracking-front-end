import React, { useState, useEffect } from "react";
import {
  Box,
  AppBar,
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
  CircularProgress,
  Snackbar,
  Alert,
  useTheme
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import Sidebar from "../../components/Sidebar";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useCustomTheme } from "../../context/ThemeContext";
import Navbar from "../../components/Navbar";

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

const fetchUserProfile = async (): Promise<User> => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }
  });

  return {
    name: response.data.employeeName || "",
    username: response.data.username || "",
    password: "********",
    email: response.data.email || "",
    id: response.data.epf || "",
    department: response.data.department || "",
    contact: response.data.contact || "",
    photo: response.data.photo || ""
  };
};

const updateUserProfile = async (user: Partial<User>): Promise<void> => {
  await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/user`, user, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }
  });
};

const uploadUserPhoto = async (formData: FormData): Promise<void> => {
  await axios.post(`${import.meta.env.VITE_API_BASE_URL}/user/photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }
  });
};

const UserProfile: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [, setOpenPhoto] = useState(false);
  const [editUser, setEditUser] = useState<User>(defaultUser);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const theme = useTheme();
  useCustomTheme();

  const queryClient = useQueryClient();

  // Fetch user data using React Query
  const { data: user, isLoading: isDataLoading } = useQuery<User>({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
  });

  useEffect(() => {
    if (user) {
      setEditUser(user);
    }
  }, [user]);

  // Update profile mutation
  const updateProfileMutation = useMutation<void, Error, Partial<User>>({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setOpenEdit(false);
      showSnackbar("Profile updated successfully!", "success");
    },
    onError: () => {
      showSnackbar("Failed to update profile", "error");
    }
  });

  // Upload photo mutation
  const uploadPhotoMutation = useMutation<void, Error, FormData>({
    mutationFn: uploadUserPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setOpenPhoto(false);
      showSnackbar("Photo uploaded successfully!", "success");
    },
    onError: () => {
      showSnackbar("Failed to upload photo", "error");
    }
  });

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
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
    
    // Create a copy of editUser without the photo property
    const { photo, ...userData } = editUser;
    updateProfileMutation.mutate(userData);
  };

  // // Handle photo upload
  // const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     const file = e.target.files[0];
  //     const formData = new FormData();
  //     formData.append("photo", file);
  //     uploadPhotoMutation.mutate(formData);
  //   }
  // };

  const isMutating = updateProfileMutation.isPending || uploadPhotoMutation.isPending;

  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar
        open={sidebarOpen || hovered}
        setOpen={setSidebarOpen}
      />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="static"
          sx={{
            bgcolor: theme.palette.background.paper,
            boxShadow: 'none',
            borderBottom: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.primary
          }}
        >
          <Navbar
            title="User Profile"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </AppBar>

        {/* Profile Card - Always visible */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Box sx={{
            bgcolor: theme.palette.background.paper,
            p: 4,
            borderRadius: 3,
            boxShadow: 3,
            maxWidth: 900,
            mx: "auto",
            mt: 10,
          }}>
            {/* Profile Photo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Avatar
                src={user?.photo || "/default-avatar.png"}
                sx={{ width: 100, height: 100 }}
              />
              <Button
                variant="outlined"
                onClick={() => setOpenPhoto(true)}
                disabled={isMutating}
              >
                Change photo
              </Button>
            </Box>

            {/* User Info - Always shows labels even if values are empty */}
            <Typography variant="h6" sx={{ mb: 2 }}>User Info</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Typography><b>Name:</b> {isDataLoading ? <CircularProgress size={16} /> : user?.name || "-"}</Typography>
              <Typography><b>Username:</b> {isDataLoading ? <CircularProgress size={16} /> : user?.username || "-"}</Typography>
              <Typography><b>Password:</b> {isDataLoading ? <CircularProgress size={16} /> : user?.password.replace(/./g, "*")}</Typography>
              <Typography><b>Email:</b> {isDataLoading ? <CircularProgress size={16} /> : user?.email || "-"}</Typography>
              <Typography><b>ID:</b> {isDataLoading ? <CircularProgress size={16} /> : user?.id || "-"}</Typography>
              <Typography><b>Department:</b> {isDataLoading ? <CircularProgress size={16} /> : user?.department || "-"}</Typography>
              <Typography><b>Contact:</b> {isDataLoading ? <CircularProgress size={16} /> : user?.contact || "-"}</Typography>
            </Box>

            {/* Edit Button */}
            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                sx={{ bgcolor: "primary.main" }}
                onClick={() => setOpenEdit(true)}
                disabled={isMutating}
              >
                Edit
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Edit User Dialog */}
        <Dialog
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          sx={{ '& .MuiDialog-paper': { width: '90%', maxWidth: 600 } }}
        >
          <DialogTitle>Edit User Info</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={editUser.name}
              onChange={handleEditChange}
              sx={{ mt: 3, mb: 2 }}
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
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
            <Button
              onClick={handleSaveEdit}
              variant="contained"
              disabled={isMutating}
              startIcon={isMutating ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isMutating ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Photo Upload Dialog
        <Dialog open={openPhoto} onClose={() => setOpenPhoto(false)}>
          <DialogTitle>Upload New Photo</DialogTitle>
          <DialogContent>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={isMutating}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPhoto(false)}>Cancel</Button>
          </DialogActions>
        </Dialog> */}
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