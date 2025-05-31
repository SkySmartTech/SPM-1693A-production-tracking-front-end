import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  CssBaseline,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Fullscreen as FullscreenIcon,
  AccountCircle as AccountCircleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import Sidebar from "../../components/Sidebar";
import { Menu, Badge } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

// Define interfaces for each table type
interface Color {
  id: number;
  color: string;
  color_code: string;
  updated_at: string;
  created_at: string;
}

interface Size {
  id: number;
  size_name: string;
  description: string;
  updated_at: string;
  created_at: string;
}

interface Style {
  id: number;
  style_no: string;
  style_description: string;
  state: string;
  status: string;
  created_at: string;
}

interface Operation {
  id: number;
  style_no: string;
  operation: string;
  sequence_no: number;
  smv: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Defect {
  id: number;
  style_no: string;
  operation: string;
  code_no: string;
  defect_code: string;
  status: string;
  created_at: string;
}

const SystemManagement = () => {
  const [activeTab, setActiveTab] = useState(0); // Changed to allow updating
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationCount] = useState(3);
  const navigate = useNavigate();
  const [loading, setLoading] = useState({
    table: false,
    form: false,
    delete: false
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Data states
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);

  // Form states
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editId, setEditId] = useState<number | null>(null);

  const API_BASE_URL = 'http://localhost:8000/api';

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, table: true }));
        let endpoint = '';
        switch (activeTab) {
          case 0: endpoint = '/colors'; break;
          case 1: endpoint = '/sizes'; break;
          case 2: endpoint = '/styles'; break;
          case 3: endpoint = '/operations'; break;
          case 4: endpoint = '/defects'; break;
          default: endpoint = '/colors';
        }
        
        const response = await axios.get(`${API_BASE_URL}${endpoint}`);
        switch (activeTab) {
          case 0: setColors(response.data); break;
          case 1: setSizes(response.data); break;
          case 2: setStyles(response.data); break;
          case 3: setOperations(response.data); break;
          case 4: setDefects(response.data); break;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showSnackbar('Failed to load data', 'error');
      } finally {
        setLoading(prev => ({ ...prev, table: false }));
      }
    };

    fetchData();
  }, [activeTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddClick = () => {
    setFormData({});
    setEditId(null);
    setOpenForm(true);
  };

  const handleEditClick = (item: any) => {
    setFormData(item);
    setEditId(item.id);
    setOpenForm(true);
  };

  const handleDeleteClick = async (id: number) => {
    try {
      setLoading(prev => ({ ...prev, delete: true }));
      let endpoint = '';
      switch (activeTab) {
        case 0: endpoint = '/colors'; break;
        case 1: endpoint = '/sizes'; break;
        case 2: endpoint = '/styles'; break;
        case 3: endpoint = '/operations'; break;
        case 4: endpoint = '/defects'; break;
      }
      
      await axios.delete(`${API_BASE_URL}${endpoint}/${id}`);
      showSnackbar('Item deleted successfully', 'success');
      
      // Refresh data
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      switch (activeTab) {
        case 0: setColors(response.data); break;
        case 1: setSizes(response.data); break;
        case 2: setStyles(response.data); break;
        case 3: setOperations(response.data); break;
        case 4: setDefects(response.data); break;
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      showSnackbar('Failed to delete item', 'error');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleFormSubmit = async () => {
    try {
      setLoading(prev => ({ ...prev, form: true }));
      let endpoint = '';
      switch (activeTab) {
        case 0: endpoint = '/colors'; break;
        case 1: endpoint = '/sizes'; break;
        case 2: endpoint = '/styles'; break;
        case 3: endpoint = '/operations'; break;
        case 4: endpoint = '/defects'; break;
      }

      if (editId) {
        await axios.put(`${API_BASE_URL}${endpoint}/${editId}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}${endpoint}`, formData);
      }

      showSnackbar(`Item ${editId ? 'updated' : 'added'} successfully`, 'success');
      setOpenForm(false);
      
      // Refresh data
      const refreshResponse = await axios.get(`${API_BASE_URL}${endpoint}`);
      switch (activeTab) {
        case 0: setColors(refreshResponse.data); break;
        case 1: setSizes(refreshResponse.data); break;
        case 2: setStyles(refreshResponse.data); break;
        case 3: setOperations(refreshResponse.data); break;
        case 4: setDefects(refreshResponse.data); break;
      }
    } catch (error) {
      console.error('Error saving data:', error);
      showSnackbar(`Failed to ${editId ? 'update' : 'add'} item`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const renderTable = () => {
    switch (activeTab) {
      case 0: // Colors
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell>Color Code</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {colors.map((color) => (
                  <TableRow key={color.id}>
                    <TableCell>{color.id}</TableCell>
                    <TableCell>{color.color}</TableCell>
                    <TableCell>{color.color_code}</TableCell>
                    <TableCell>{color.updated_at}</TableCell>
                    <TableCell>{color.created_at}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(color)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(color.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 1: // Sizes
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Size Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sizes.map((size) => (
                  <TableRow key={size.id}>
                    <TableCell>{size.id}</TableCell>
                    <TableCell>{size.size_name}</TableCell>
                    <TableCell>{size.description}</TableCell>
                    <TableCell>{size.updated_at}</TableCell>
                    <TableCell>{size.created_at}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(size)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(size.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 2: // Styles
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Style No</TableCell>
                  <TableCell>Style Description</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {styles.map((style) => (
                  <TableRow key={style.id}>
                    <TableCell>{style.id}</TableCell>
                    <TableCell>{style.style_no}</TableCell>
                    <TableCell>{style.style_description}</TableCell>
                    <TableCell>{style.state}</TableCell>
                    <TableCell>{style.status}</TableCell>
                    <TableCell>{style.created_at}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(style)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(style.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 3: // Operations
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Style No</TableCell>
                  <TableCell>Operation</TableCell>
                  <TableCell>Sequence No</TableCell>
                  <TableCell>SMV</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {operations.map((operation) => (
                  <TableRow key={operation.id}>
                    <TableCell>{operation.id}</TableCell>
                    <TableCell>{operation.style_no}</TableCell>
                    <TableCell>{operation.operation}</TableCell>
                    <TableCell>{operation.sequence_no}</TableCell>
                    <TableCell>{operation.smv}</TableCell>
                    <TableCell>{operation.status}</TableCell>
                    <TableCell>{operation.created_at}</TableCell>
                    <TableCell>{operation.updated_at}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(operation)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(operation.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 4: // Defects
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Style No</TableCell>
                  <TableCell>Operation</TableCell>
                  <TableCell>Code No</TableCell>
                  <TableCell>Defect Code</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {defects.map((defect) => (
                  <TableRow key={defect.id}>
                    <TableCell>{defect.id}</TableCell>
                    <TableCell>{defect.style_no}</TableCell>
                    <TableCell>{defect.operation}</TableCell>
                    <TableCell>{defect.code_no}</TableCell>
                    <TableCell>{defect.defect_code}</TableCell>
                    <TableCell>{defect.status}</TableCell>
                    <TableCell>{defect.created_at}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(defect)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(defect.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      default:
        return null;
    }
  };

  const renderForm = () => {
    switch (activeTab) {
      case 0: // Colors
        return (
          <>
            <TextField
              fullWidth
              label="Color"
              name="color"
              value={formData.color || ''}
              onChange={handleFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Color Code"
              name="color_code"
              value={formData.color_code || ''}
              onChange={handleFormChange}
              margin="normal"
            />
          </>
        );
      case 1: // Sizes
        return (
          <>
            <TextField
              fullWidth
              label="Size Name"
              name="size_name"
              value={formData.size_name || ''}
              onChange={handleFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description || ''}
              onChange={handleFormChange}
              margin="normal"
            />
          </>
        );
      case 2: // Styles
        return (
          <>
            <TextField
              fullWidth
              label="Style No"
              name="style_no"
              value={formData.style_no || ''}
              onChange={handleFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Style Description"
              name="style_description"
              value={formData.style_description || ''}
              onChange={handleFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="State"
              name="state"
              value={formData.state || ''}
              onChange={handleFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Status"
              name="status"
              value={formData.status || ''}
              onChange={handleFormChange}
              margin="normal"
            />
          </>
        );
      case 3: // Operations
        return (
          <>
            <TextField
              fullWidth
              label="Style No"
              name="style_no"
              value={formData.style_no || ''}
              onChange={handleFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Operation"
              name="operation"
              value={formData.operation || ''}
              onChange={handleFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Sequence No"
              name="sequence_no"
              type="number"
              value={formData.sequence_no || ''}
              onChange={handleFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="SMV"
              name="smv"
              type="number"
              value={formData.smv || ''}
              onChange={handleFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Status"
              name="status"
              value={formData.status || ''}
              onChange={handleFormChange}
              margin="normal"
            />
          </>
        );
      case 4: 
      // Defects
        return (
          <>
            <TextField
              fullWidth
              label="Style No"
              name="style_no"
              value={formData.style_no || ''}
              onChange={handleFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Operation"
              name="operation"
              value={formData.operation || ''}
              onChange={handleFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Code No"
              name="code_no"
              value={formData.code_no || ''}
              onChange={handleFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Defect Code"
              name="defect_code"
              value={formData.defect_code || ''}
              onChange={handleFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Status"
              name="status"
              value={formData.status || ''}
              onChange={handleFormChange}
              margin="normal"
            />
          </>
        );
        // chkpoint    id,chkpoint name,creted , updated 
       case 5: 
        return (
          <>
            <TextField
              fullWidth
              label="Style No"
              name="style_no"
              value={formData.style_no || ''}
              onChange={handleFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Operation"
              name="operation"
              value={formData.operation || ''}
              onChange={handleFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Code No"
              name="code_no"
              value={formData.code_no || ''}
              onChange={handleFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Defect Code"
              name="defect_code"
              value={formData.defect_code || ''}
              onChange={handleFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Status"
              name="status"
              value={formData.status || ''}
              onChange={handleFormChange}
              margin="normal"
            />
          </>
        );
      default:
        return null;
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

        <Box sx={{ p: 3, flexGrow: 1, overflow: "auto" }}>
          {/* Add Tabs navigation */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="system management tabs">
              <Tab label="Colors" />
              <Tab label="Sizes" />
              <Tab label="Styles" />
              <Tab label="Operations" />
              <Tab label="Defects" />
            </Tabs>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
              disabled={loading.table}
            >
              Add Data
            </Button>
          </Box>

          {loading.table ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            renderTable()
          )}
        </Box>
      </Box>

      {/* Form Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent>
          {renderForm()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            disabled={loading.form}
            startIcon={loading.form ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading.form ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

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