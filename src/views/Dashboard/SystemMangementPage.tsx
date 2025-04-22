import { useState, useEffect } from 'react';
import {
  Tabs,
  Tab,
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  AppBar,
  Toolbar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CssBaseline,
  Divider,
  Snackbar
} from '@mui/material';
import {
  Palette,
  Straighten,
  Style,
  Build,
  BugReport,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Fullscreen as FullscreenIcon,
  AccountCircle as AccountCircleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { Menu, MenuItem, Badge } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

interface TableData {
  id: number;
  [key: string]: any;
}

interface TableConfig {
  name: string;
  endpoint: string;
  data: TableData[];
  columns: string[];
}

const SystemManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TableData>({ id: 0 });
  const [editId, setEditId] = useState<number | null>(null);
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

  const tableConfigs: TableConfig[] = [
    { 
      name: 'Color Settings', 
      endpoint: 'colors',
      data: [],
      columns: ['name', 'code', 'description']
    },
    { 
      name: 'Size Settings', 
      endpoint: 'sizes',
      data: [],
      columns: ['name', 'description']
    },
    { 
      name: 'Style Settings', 
      endpoint: 'styles',
      data: [],
      columns: ['name', 'buyer', 'description']
    },
    { 
      name: 'Operation Settings', 
      endpoint: 'operations',
      data: [],
      columns: ['name', 'code', 'description']
    },
    { 
      name: 'Defect Settings', 
      endpoint: 'defects',
      data: [],
      columns: ['name', 'code', 'description', 'severity']
    }
  ];

  // Fetch data when tab changes or component mounts
  useEffect(() => {
    fetchData(tableConfigs[activeTab].endpoint);
  }, [activeTab]);

  const fetchData = async (endpoint: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/${endpoint}`);
      const updatedConfigs = [...tableConfigs];
      updatedConfigs[activeTab].data = response.data;
      setTableData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      showSnackbar("Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAddData = () => {
    setFormData({ id: 0 });
    setEditId(null);
    setIsDialogOpen(true);
  };

  const handleEditData = (id: number) => {
    const dataToEdit = tableData.find(item => item.id === id);
    if (dataToEdit) {
      setFormData(dataToEdit);
      setEditId(id);
      setIsDialogOpen(true);
    }
  };

  const handleDeleteData = async (id: number) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:8000/api/${tableConfigs[activeTab].endpoint}/${id}`);
      fetchData(tableConfigs[activeTab].endpoint);
      showSnackbar("Item deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting data:", error);
      showSnackbar("Failed to delete item", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setFormData({ id: 0 });
    setEditId(null);
  };

  const handleFormSubmit = async () => {
    try {
      setLoading(true);
      const endpoint = tableConfigs[activeTab].endpoint;
      
      if (editId !== null) {
        await axios.put(`http://localhost:8000/api/${endpoint}/${editId}`, formData);
        showSnackbar("Item updated successfully", "success");
      } else {
        await axios.post(`http://localhost:8000/api/${endpoint}`, formData);
        showSnackbar("Item added successfully", "success");
      }
      
      fetchData(endpoint);
      handleDialogClose();
    } catch (error) {
      console.error("Error saving data:", error);
      showSnackbar(editId ? "Failed to update item" : "Failed to add item", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderActionButtons = (params: any) => (
    <>
      <IconButton onClick={() => handleEditData(params.row.id)} disabled={loading}>
        <EditIcon color="primary" />
      </IconButton>
      <IconButton onClick={() => handleDeleteData(params.row.id)} disabled={loading}>
        <DeleteIcon color="error" />
      </IconButton>
    </>
  );

  const columns: GridColDef[] = [
    ...tableConfigs[activeTab].columns.map(key => ({
      field: key,
      headerName: key.replace(/_/g, ' ').toUpperCase(),
      width: 180,
      editable: false
    })),
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: renderActionButtons,
      sortable: false,
      filterable: false
    }
  ];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
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
    <Box sx={{ display: "full", width: "100vw", height: "100vh", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <CssBaseline />

      <Sidebar
        open={sidebarOpen || hovered}
        setOpen={setSidebarOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AppBar position="static" sx={{ bgcolor: 'white', boxShadow: 2 }}>
          <Toolbar>
            <IconButton edge="start" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, color: 'black' }}>
              System Management
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

              <IconButton onClick={toggleFullscreen}>
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

        <Box sx={{ p: 3, flexGrow: 1, overflow: "auto" }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="scrollable"
            sx={{ mb: 2 }}
          >
            {tableConfigs.map((config, index) => (
              <Tab 
                key={index} 
                label={config.name} 
                icon={index === 0 ? <Palette /> : 
                      index === 1 ? <Straighten /> : 
                      index === 2 ? <Style /> : 
                      index === 3 ? <Build /> : <BugReport />} 
              />
            ))}
          </Tabs>

          <Button
            variant="contained"
            sx={{ mb: 2 }}
            onClick={handleAddData}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? "Processing..." : "Add Data"}
          </Button>

          <Paper elevation={3} sx={{ height: '70vh', borderRadius: 2 }}>
            <DataGrid
              rows={tableData}
              columns={columns}
              pageSizeOptions={[10, 25, 50]}
              loading={loading}
              sx={{
                '& .MuiDataGrid-cell': {
                  borderRight: '1px solid rgba(224, 224, 224, 1)'
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f5f5f5',
                }
              }}
            />
          </Paper>

          <Dialog open={isDialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
            <DialogTitle>{editId ? 'Edit Data' : 'Add Data'}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {tableConfigs[activeTab].columns.map(key => (
                  <Grid item xs={12} key={key}>
                    <TextField
                      label={key.replace(/_/g, ' ').toUpperCase()}
                      fullWidth
                      value={formData[key] || ''}
                      onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                      margin="normal"
                    />
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose} disabled={loading}>Cancel</Button>
              <Button 
                onClick={handleFormSubmit} 
                variant="contained" 
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? "Saving..." : (editId ? 'Update' : 'Add')}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
        <Footer />
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

export default SystemManagement;