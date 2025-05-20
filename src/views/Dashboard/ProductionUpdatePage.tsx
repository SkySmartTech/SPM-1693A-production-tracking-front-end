import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Grid,
  Card,
  CircularProgress,
  Select,
  InputLabel,
  FormControl,
  Avatar,
  Divider,
  CssBaseline,
  Button,
  SelectChangeEvent,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Fullscreen as FullscreenIcon,
  AccountCircle as AccountCircleIcon,
  ExpandMore,
  Person,
  Style as StyleIcon,
  AssignmentTurnedIn
} from '@mui/icons-material';
import { Delete } from '@mui/icons-material';
import axios from 'axios';
import Sidebar from "../../components/Sidebar";
import Footer from '../../components/Footer';
import { Menu, MenuItem, Badge } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface ProductionData {
  buyer: string;
  gg: string;
  smv: string;
  presentCarder: string;
  reworkCount: number;
  successCount: number;
  defectCount: number;
  hourlyData: number[];
}

interface Filters {
  teamNo: string;
  style: string;
  color: string;
  size: string;
  checkPoint: string;
}

interface DropdownOptions {
  teams: string[];
  styles: string[];
  colors: string[];
  sizes: string[];
  checkPoints: string[];
}

interface DefectReworkData {
  parts: string[];
  locations: string[];
  defectCodes: string[];
}

const defaultProductionData: ProductionData = {
  buyer: 'N/A',
  gg: '0',
  smv: '0',
  presentCarder: '0',
  reworkCount: 0,
  successCount: 0,
  defectCount: 0,
  hourlyData: [0, 0, 0, 0, 0, 0, 0, 0]
};

const ProductionUpdatePage = () => {
  const [data, setData] = useState<ProductionData>(defaultProductionData);
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptions>({
    teams: [],
    styles: [],
    colors: [],
    sizes: [],
    checkPoints: []
  });
  const [defectReworkOptions, setDefectReworkOptions] = useState<DefectReworkData>({
    parts: [],
    locations: [],
    defectCodes: []
  });
  const [loading, setLoading] = useState({
    data: false,
    options: true,
    submit: false,
    defectReworkOptions: false
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationCount] = useState(3);
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>({
    teamNo: '',
    style: '',
    color: '',
    size: '',
    checkPoint: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [dialogOpen, setDialogOpen] = useState({
    rework: false,
    defect: false
  });
  const [formData, setFormData] = useState({
    part: '',
    location: '',
    defectCode: ''
  });

  const API_BASE_URL = 'http://localhost:8000/api';

  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/production-options`);
        const options = {
          teams: response.data.teams || [],
          styles: response.data.styles || [],
          colors: response.data.colors || [],
          sizes: response.data.sizes || [],
          checkPoints: response.data.checkPoints || []
        };

        setDropdownOptions(options);

        if (options.teams.length > 0) {
          setFilters({
            teamNo: options.teams[0],
            style: options.styles[0] || '',
            color: options.colors[0] || '',
            size: options.sizes[0] || '',
            checkPoint: options.checkPoints[0] || ''
          });
        }
      } catch (error) {
        console.error('Error fetching dropdown options:', error);
        showSnackbar('Failed to load dropdown options', 'error');
      } finally {
        setLoading(prev => ({ ...prev, options: false }));
      }
    };

    fetchDropdownOptions();
  }, []);

  useEffect(() => {
    const fetchDefectReworkOptions = async () => {
      try {
        setLoading(prev => ({ ...prev, defectReworkOptions: true }));
        const response = await axios.get(`${API_BASE_URL}/defect-rework-options`);
        setDefectReworkOptions({
          parts: response.data.parts || [],
          locations: response.data.locations || [],
          defectCodes: response.data.defectCodes || []
        });
      } catch (error) {
        console.error('Error fetching defect/rework options:', error);
        showSnackbar('Failed to load defect/rework options', 'error');
      } finally {
        setLoading(prev => ({ ...prev, defectReworkOptions: false }));
      }
    };

    fetchDefectReworkOptions();
  }, []);

  useEffect(() => {
    const fetchProductionData = async () => {
      if (!filters.teamNo) return;

      try {
        setLoading(prev => ({ ...prev, data: true }));
        const response = await axios.get(`${API_BASE_URL}/production-data`, {
          params: filters
        });
        setData(response.data || defaultProductionData);
      } catch (error) {
        console.error('Error fetching production data:', error);
        showSnackbar('Failed to load production data', 'error');
        setData(defaultProductionData);
      } finally {
        setLoading(prev => ({ ...prev, data: false }));
      }
    };

    fetchProductionData();
  }, [filters]);

  const handleChange = async (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target as { name: keyof Filters; value: string };
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    try {
      setLoading(prev => ({ ...prev, submit: true }));
      const response = await axios.get(`${API_BASE_URL}/production-data`, {
        params: newFilters
      });
      setData(response.data || defaultProductionData);
    } catch (error) {
      console.error('Error updating data with new filters', error);
      showSnackbar('Failed to update data with new filters', 'error');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleFormChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDialogOpen = (type: 'rework' | 'defect') => {
    setDialogOpen(prev => ({ ...prev, [type]: true }));
  };

  const handleDialogClose = (type: 'rework' | 'defect') => {
    setDialogOpen(prev => ({ ...prev, [type]: false }));
    setFormData({ part: '', location: '', defectCode: '' });
  };

  const handleSubmit = async (type: 'rework' | 'defect') => {
    try {
      setLoading(prev => ({ ...prev, submit: true }));
      await axios.post(`${API_BASE_URL}/${type}-submit`, {
        ...formData,
        ...filters
      });
      showSnackbar(`${type.charAt(0).toUpperCase() + type.slice(1)} submitted successfully`, 'success');
      handleDialogClose(type);

      // Refresh production data
      const response = await axios.get(`${API_BASE_URL}/production-data`, {
        params: filters
      });
      setData(response.data || defaultProductionData);
    } catch (error) {
      console.error(`Error submitting ${type}:`, error);
      showSnackbar(`Failed to submit ${type}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.error('Error attempting to exit fullscreen:', err);
      });
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
    <Box sx={{ display: "flex", width: "100vw", height: "100vh", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
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
            <IconButton edge="start" color="inherit" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MenuIcon sx={{ color: 'black' }} />
            </IconButton>

            <Typography variant="h6" sx={{ flexGrow: 1, color: "black" }}>
              Production Update
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
          {loading.options ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ ml: 2 }}>Loading dropdown options...</Typography>
            </Box>
          ) : (
            <Card sx={{ p: 3, borderRadius: '12px', boxShadow: 3 }}>
              {/* Top Info Section */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {[
                  { label: 'BUYER', value: data.buyer, icon: <Person /> },
                  { label: 'GG', value: data.gg, icon: <StyleIcon /> },
                  { label: 'SMV', value: data.smv, icon: <AssignmentTurnedIn /> },
                  { label: 'PRESENT CARDER', value: data.presentCarder, icon: <Person /> }
                ].map((item, index) => (
                  <Grid item xs={12} sm={3} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 4 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>{item.icon}</Avatar>
                      <div>
                        <Typography variant="subtitle2" color="textSecondary">
                          {item.label}
                        </Typography>
                        <Typography variant="h6">{item.value}</Typography>
                      </div>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Filters Section */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { label: 'TEAM NO', name: 'teamNo', options: dropdownOptions.teams },
                  { label: 'STYLE', name: 'style', options: dropdownOptions.styles },
                  { label: 'COLOR', name: 'color', options: dropdownOptions.colors },
                  { label: 'SIZE', name: 'size', options: dropdownOptions.sizes },
                  { label: 'CHECK POINT', name: 'checkPoint', options: dropdownOptions.checkPoints }
                ].map((filter, index) => (
                  <Grid item xs={12} md={2.4} key={index}>
                    <FormControl fullWidth>
                      <InputLabel>{filter.label}</InputLabel>
                      <Select
                        name={filter.name}
                        value={filters[filter.name as keyof Filters] || ''}
                        label={filter.label}
                        onChange={handleChange}
                        IconComponent={ExpandMore}
                        sx={{ borderRadius: '8px', marginBottom: 4 }}
                        disabled={loading.submit || loading.data || filter.options.length === 0}
                      >
                        {filter.options.map((option, i) => (
                          <MenuItem key={i} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                ))}
              </Grid>

              {/* Status Cards */}
              {loading.data ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress size={40} />
                </Box>
              ) : (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {[
                    {
                      title: 'Success',
                      value: data.successCount,
                      gradient: 'linear-gradient(to right, #00BA57, #006931)',
                      icon: <AssignmentTurnedIn sx={{ fontSize: 40, opacity: 0.8 }} />,
                      onClick: null
                    },
                    {
                      title: 'Rework',
                      value: data.reworkCount,
                      gradient: 'linear-gradient(to right, #FFD900, #DB5B00)',
                      icon: <StyleIcon sx={{ fontSize: 40, opacity: 0.8 }} />,
                      onClick: () => handleDialogOpen('rework')
                    },
                    {
                      title: 'Defect',
                      value: data.defectCount,
                      gradient: 'linear-gradient(to right, #EB0004, #960003)',
                      icon: <Delete sx={{ fontSize: 40, opacity: 0.8 }} />,
                      onClick: () => handleDialogOpen('defect')
                    }
                  ].map((status, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: '12px',
                          background: status.gradient,
                          color: 'white',
                          boxShadow: 3,
                          height: 120,
                          width: 300,
                          display: 'flex',
                          marginBottom: 5,
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          position: 'relative',
                          transition: 'transform 0.3s',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            cursor: status.onClick ? 'pointer' : 'default'
                          }
                        }}
                        onClick={status.onClick || undefined}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {status.title}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ position: 'absolute', bottom: 10, left: 15 }}>
                            {status.icon}
                          </Box>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', position: 'absolute', bottom: 10, right: 15 }}>
                            {status.value}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Hourly Boxes */}
              <Grid container spacing={2}>
                {data.hourlyData.map((value, index) => (
                  <Grid item xs={12} sm={6} md={3} lg={1.5} key={index}>
                    <Box sx={{
                      p: 2,
                      textAlign: 'center',
                      borderRadius: '8px',
                      boxShadow: 3,
                      bgcolor: '#78B3CE',
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        HOUR: {index + 1}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="h5">{value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>
          )}
        </Box>
        <Footer />

        {/* Rework Dialog */}
        <Dialog
          open={dialogOpen.rework}
          onClose={() => handleDialogClose('rework')}
          sx={{
            '& .MuiDialog-paper': {
              width: '400px', 
              maxWidth: 'none' 
            }
          }}
        >
          <DialogTitle>Details for Rework</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <img
                src="/images/tshirt.png"
                alt="Tshirt"
                style={{ width: '100px', height: '100px' }}
              />
            </Box>
            <FormControl fullWidth sx={{ my: 2 }}>
              <InputLabel>Part</InputLabel>
              <Select
                name="part"
                value={formData.part}
                label="Part"
                onChange={handleFormChange}
                disabled={loading.defectReworkOptions}
              >
                {defectReworkOptions.parts.map((part, index) => (
                  <MenuItem key={index} value={part}>{part}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ my: 2 }}>
              <InputLabel>Location</InputLabel>
              <Select
                name="location"
                value={formData.location}
                label="Location"
                onChange={handleFormChange}
                disabled={loading.defectReworkOptions}
              >
                {defectReworkOptions.locations.map((location, index) => (
                  <MenuItem key={index} value={location}>{location}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ my: 2 }}>
              <InputLabel>Defect Code</InputLabel>
              <Select
                name="defectCode"
                value={formData.defectCode}
                label="Defect Code"
                onChange={handleFormChange}
                disabled={loading.defectReworkOptions}
              >
                {defectReworkOptions.defectCodes.map((code, index) => (
                  <MenuItem key={index} value={code}>{code}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleDialogClose('rework')} disabled={loading.submit}>
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit('rework')}
              disabled={loading.submit || !formData.part || !formData.location || !formData.defectCode}
              variant="contained"
            >
              {loading.submit ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Defect Dialog */}
        <Dialog
          open={dialogOpen.defect}
          onClose={() => handleDialogClose('defect')}
          sx={{
            '& .MuiDialog-paper': {
              width: '400px', 
              maxWidth: 'none' 
            }
          }}
        >
          <DialogTitle>Details for Defect</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <img
                src="/images/tshirt.png"
                alt="T-shirt"
                style={{ width: '100px', height: '100px' }}
              />
            </Box>
            <FormControl fullWidth sx={{ my: 2 }}>
              <InputLabel>Part</InputLabel>
              <Select
                name="part"
                value={formData.part}
                label="Part"
                onChange={handleFormChange}
                disabled={loading.defectReworkOptions}
              >
                {defectReworkOptions.parts.map((part, index) => (
                  <MenuItem key={index} value={part}>{part}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ my: 2 }}>
              <InputLabel>Location</InputLabel>
              <Select
                name="location"
                value={formData.location}
                label="Location"
                onChange={handleFormChange}
                disabled={loading.defectReworkOptions}
              >
                {defectReworkOptions.locations.map((location, index) => (
                  <MenuItem key={index} value={location}>{location}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ my: 2 }}>
              <InputLabel>Defect Code</InputLabel>
              <Select
                name="defectCode"
                value={formData.defectCode}
                label="Defect Code"
                onChange={handleFormChange}
                disabled={loading.defectReworkOptions}
              >
                {defectReworkOptions.defectCodes.map((code, index) => (
                  <MenuItem key={index} value={code}>{code}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleDialogClose('defect')} disabled={loading.submit}>
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit('defect')}
              disabled={loading.submit || !formData.part || !formData.location || !formData.defectCode}
              variant="contained"
            >
              {loading.submit ? <CircularProgress size={24} /> : 'Submit'}
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
    </Box>
  );
};

export default ProductionUpdatePage;