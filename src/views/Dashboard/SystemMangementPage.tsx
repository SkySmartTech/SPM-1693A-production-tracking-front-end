// src/pages/SystemManagement/SystemManagement.tsx
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
  Tab,
  useTheme,
  Select,
  InputLabel,
  FormControl,
  SelectChangeEvent
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
import { useCustomTheme } from '../../context/ThemeContext';
import {
  fetchColors,
  fetchSizes,
  fetchStyles,
  fetchOperations,
  fetchDefects,
  fetchCheckPoints,
  createColor,
  createSize,
  createStyle,
  createOperation,
  createDefect,
  createCheckPoint,
  updateColor,
  updateSize,
  updateStyle,
  updateOperation,
  updateDefect,
  updateCheckPoint,
  deleteColor,
  deleteSize,
  deleteStyle,
  deleteOperation,
  deleteDefect,
  deleteCheckPoint,
  fetchStyleOptions,
  fetchOperationOptions
} from '../../api/systemManagementApi';

const SystemManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationCount] = useState(3);
  const navigate = useNavigate();
  const [loading, setLoading] = useState({
    table: false,
    form: false,
    delete: false,
    options: false
  });
  const theme = useTheme();
  useCustomTheme();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Data states
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [styles, setStyles] = useState<any[]>([]);
  const [operations, setOperations] = useState<any[]>([]);
  const [defects, setDefects] = useState<any[]>([]);
  const [checkPoints, setCheckPoints] = useState<any[]>([]);

  // Dropdown options
  const [styleOptions, setStyleOptions] = useState<{ style_no: string }[]>([]);
  const [operationOptions, setOperationOptions] = useState<{ operation: string }[]>([]);

  // Form states
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editId, setEditId] = useState<number | null>(null);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, table: true }));
        switch (activeTab) {
          case 0: 
            const colorsData = await fetchColors();
            setColors(colorsData);
            break;
          case 1: 
            const sizesData = await fetchSizes();
            setSizes(sizesData);
            break;
          case 2: 
            const stylesData = await fetchStyles();
            setStyles(stylesData);
            break;
          case 3: 
            const operationsData = await fetchOperations();
            setOperations(operationsData);
            break;
          case 4: 
            const defectsData = await fetchDefects();
            setDefects(defectsData);
            break;
          case 5: 
            const checkPointsData = await fetchCheckPoints();
            setCheckPoints(checkPointsData);
            break;
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

  // Fetch dropdown options when needed
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        setLoading(prev => ({ ...prev, options: true }));
        const styles = await fetchStyleOptions();
        setStyleOptions(styles);
        const operations = await fetchOperationOptions();
        setOperationOptions(operations);
      } catch (error) {
        console.error('Error fetching dropdown options:', error);
        showSnackbar('Failed to load dropdown options', 'error');
      } finally {
        setLoading(prev => ({ ...prev, options: false }));
      }
    };

    if (activeTab === 3 || activeTab === 4) { // Operations or Defects tab
      fetchDropdowns();
    }
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
      switch (activeTab) {
        case 0: await deleteColor(id); break;
        case 1: await deleteSize(id); break;
        case 2: await deleteStyle(id); break;
        case 3: await deleteOperation(id); break;
        case 4: await deleteDefect(id); break;
        case 5: await deleteCheckPoint(id); break;
      }
      showSnackbar('Item deleted successfully', 'success');
      
      // Refresh data
      switch (activeTab) {
        case 0: setColors(await fetchColors()); break;
        case 1: setSizes(await fetchSizes()); break;
        case 2: setStyles(await fetchStyles()); break;
        case 3: setOperations(await fetchOperations()); break;
        case 4: setDefects(await fetchDefects()); break;
        case 5: setCheckPoints(await fetchCheckPoints()); break;
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
      let result;
      if (editId) {
        // Update existing item
        switch (activeTab) {
          case 0: result = await updateColor(editId, formData); break;
          case 1: result = await updateSize(editId, formData); break;
          case 2: result = await updateStyle(editId, formData); break;
          case 3: result = await updateOperation(editId, formData); break;
          case 4: result = await updateDefect(editId, formData); break;
          case 5: result = await updateCheckPoint(editId, formData); break;
        }
      } else {
        // Create new item
        switch (activeTab) {
          case 0: result = await createColor(formData); break;
          case 1: result = await createSize(formData); break;
          case 2: result = await createStyle(formData); break;
          case 3: result = await createOperation(formData); break;
          case 4: result = await createDefect(formData); break;
          case 5: result = await createCheckPoint(formData); break;
        }
      }

      showSnackbar(`Item ${editId ? 'updated' : 'added'} successfully`, 'success');
      setOpenForm(false);
      
      // Refresh data
      switch (activeTab) {
        case 0: setColors(await fetchColors()); break;
        case 1: setSizes(await fetchSizes()); break;
        case 2: setStyles(await fetchStyles()); break;
        case 3: setOperations(await fetchOperations()); break;
        case 4: setDefects(await fetchDefects()); break;
        case 5: setCheckPoints(await fetchCheckPoints()); break;
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

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
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
      case 5: // CheckPoints
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {checkPoints.map((checkPoint) => (
                  <TableRow key={checkPoint.id}>
                    <TableCell>{checkPoint.id}</TableCell>
                    <TableCell>{checkPoint.name}</TableCell>
                    <TableCell>{checkPoint.description}</TableCell>
                    <TableCell>{checkPoint.status}</TableCell>
                    <TableCell>{checkPoint.created_at}</TableCell>
                    <TableCell>{checkPoint.updated_at}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(checkPoint)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(checkPoint.id)}>
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
            <FormControl fullWidth margin="normal">
              <InputLabel>Style No</InputLabel>
              <Select
                name="style_no"
                value={formData.style_no || ''}
                label="Style No"
                onChange={handleSelectChange}
              >
                {styleOptions.map((option) => (
                  <MenuItem key={option.style_no} value={option.style_no}>
                    {option.style_no}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
      case 4: // Defects
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Style No</InputLabel>
              <Select
                name="style_no"
                value={formData.style_no || ''}
                label="Style No"
                onChange={handleSelectChange}
              >
                {styleOptions.map((option) => (
                  <MenuItem key={option.style_no} value={option.style_no}>
                    {option.style_no}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Operation</InputLabel>
              <Select
                name="operation"
                value={formData.operation || ''}
                label="Operation"
                onChange={handleSelectChange}
              >
                {operationOptions.map((option) => (
                  <MenuItem key={option.operation} value={option.operation}>
                    {option.operation}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
      case 5: // CheckPoints
        return (
          <>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name || ''}
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
        
      />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AppBar position="static" sx={{ bgcolor: theme.palette.background.paper, boxShadow: 2 }}>
          <Toolbar>
            <IconButton edge="start" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, color: theme.palette.text.primary }}>
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
              <Tab label="Check Points" />
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