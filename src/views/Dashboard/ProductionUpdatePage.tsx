// src/pages/ProductionUpdate/ProductionUpdatePage.tsx
import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
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
  DialogActions,
  useTheme,
  Autocomplete,
  TextField,
  Stack
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Fullscreen as FullscreenIcon,
  AccountCircle as AccountCircleIcon,
  Person,
  Style as StyleIcon,
  AssignmentTurnedIn
} from '@mui/icons-material';
import { Delete } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import { useCustomTheme } from "../../context/ThemeContext";
import Sidebar from "../../components/Sidebar";
import { Menu, MenuItem, Badge } from "@mui/material";
import {
  Production,
  fetchColorData,
  fetchStyleData,
  fetchSizeData
} from '../../api/productionApi';
import { Controller, useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';

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

interface DefectReworkData {
  parts: string[];
  locations: string[];
  defectCodes: string[];
}

interface ColorOption {
  color: string;
}

interface StyleOption {
  description: string;
  style_no: string;
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
  const [defectReworkOptions, setDefectReworkOptions] = useState<DefectReworkData>({
    parts: [],
    locations: [],
    defectCodes: []
  });
  const [loading, setLoading] = useState({
    data: false,
    options: false,
    submit: false,
    defectReworkOptions: false
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false);
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
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
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
  const theme = useTheme();
  useCustomTheme();

  // Mock functions to replace the missing API functions
  const fetchDropdownOptions = async () => {
    return {
      teams: ['Team 1', 'Team 2'],
      styles: ['Style 1', 'Style 2'],
      colors: ['Red', 'Blue'],
      sizes: ['S', 'M', 'L'],
      checkPoints: ['Check 1', 'Check 2']
    };
  };

  const fetchDefectReworkOptions = async () => {
    return {
      parts: ['Sleeve', 'Collar', 'Body'],
      locations: ['Front', 'Back', 'Side'],
      defectCodes: ['DC001', 'DC002', 'DC003']
    };
  };

  const fetchProductionData = async (_filters: Filters) => {
    return {
      ...defaultProductionData,
      buyer: 'Sample Buyer',
      gg: '123',
      smv: '5.5',
      presentCarder: '25'
    };
  };

  const submitDefectRework = async (type: 'rework' | 'defect', data: any, filters: Filters) => {
    console.log(`Submitting ${type}`, data, filters);
    return true;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(prev => ({ ...prev, options: true }));
        const options = await fetchDropdownOptions();

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
        console.error('Error loading dropdown options:', error);
        showSnackbar('Failed to load dropdown options', 'error');
      } finally {
        setLoading(prev => ({ ...prev, options: false }));
      }
    };

    const loadDefectReworkOptions = async () => {
      try {
        setLoading(prev => ({ ...prev, defectReworkOptions: true }));
        const options = await fetchDefectReworkOptions();
        setDefectReworkOptions(options);
      } catch (error) {
        console.error('Error loading defect/rework options:', error);
        showSnackbar('Failed to load defect/rework options', 'error');
      } finally {
        setLoading(prev => ({ ...prev, defectReworkOptions: false }));
      }
    };

    loadData();
    loadDefectReworkOptions();
  }, []);

  useEffect(() => {
    const loadProductionData = async () => {
      if (!filters.teamNo) return;

      try {
        setLoading(prev => ({ ...prev, data: true }));
        const productionData = await fetchProductionData(filters);
        setData(productionData);
      } catch (error) {
        console.error('Error loading production data:', error);
        showSnackbar('Failed to load production data', 'error');
        setData(defaultProductionData);
      } finally {
        setLoading(prev => ({ ...prev, data: false }));
      }
    };

    loadProductionData();
  }, [filters]);

  const handleFormChange = (event: SelectChangeEvent) => {
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
      await submitDefectRework(type, formData, filters);
      showSnackbar(`${type.charAt(0).toUpperCase() + type.slice(1)} submitted successfully`, 'success');
      handleDialogClose(type);

      // Refresh production data
      const productionData = await fetchProductionData(filters);
      setData(productionData);
    } catch (error) {
      console.error(`Error submitting ${type}:`, error);
      showSnackbar(`Failed to submit ${type}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
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

  const {
    register,
    control,
    formState: { errors },
  } = useForm<Production>({
    reValidateMode: "onChange",
    mode: "onChange",
  });

  const { data: teamData } = useQuery<StyleOption[]>({
    queryKey: ["teams"],
    queryFn: fetchSizeData,
  });

  const { data: colorData } = useQuery<ColorOption[]>({
    queryKey: ["colors"],
    queryFn: fetchColorData,
  });

  const { data: styleData } = useQuery<StyleOption[]>({
    queryKey: ["styles"],
    queryFn: fetchStyleData,
  });

  const { data: sizeData } = useQuery<StyleOption[]>({
    queryKey: ["sizes"],
    queryFn: fetchSizeData,
  });

  useQuery<StyleOption[]>({
    queryKey: ["checkPoints"],
    queryFn: fetchSizeData,
  });

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
            <IconButton edge="start" color="inherit" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MenuIcon sx={{ color: 'black' }} />
            </IconButton>

            <Typography variant="h6" sx={{ flexGrow: 1, color: theme.palette.text.primary }}>
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
              <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
                {[
                  { label: 'BUYER', value: data.buyer, icon: <Person /> },
                  { label: 'GG', value: data.gg, icon: <StyleIcon /> },
                  { label: 'SMV', value: data.smv, icon: <AssignmentTurnedIn /> },
                  { label: 'PRESENT CARDER', value: data.presentCarder, icon: <Person /> }
                ].map((item, index) => (
                  <Box key={index} sx={{ width: { xs: '100%', sm: '25%' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 4 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>{item.icon}</Avatar>
                      <div>
                        <Typography variant="subtitle2" color="textSecondary">
                          {item.label}
                        </Typography>
                        <Typography variant="h6">{item.value}</Typography>
                      </div>
                    </Box>
                  </Box>
                ))}
              </Stack>

              {/* Dropdown Section */}
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>

                <Controller
                  control={control}
                  {...register("teamNo", { required: true })}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      onChange={(_event, newValue) => field.onChange(newValue)}
                      size="small"
                      options={teamData?.map(teamNo => teamNo.description) || []}
                      sx={{ flex: 1, margin: "0.5rem" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.teamNo}
                          helperText={errors.teamNo && "Required"}
                          label="Team No"
                          name="teamNo"
                        />
                      )}
                    />
                  )}
                />
                <Controller
                  control={control}
                  {...register("color", { required: true })}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      onChange={(_event, newValue) => field.onChange(newValue)}
                      size="small"
                      options={colorData?.map(color => color.color) || []}
                      sx={{ flex: 1, margin: "0.5rem" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.color}
                          helperText={errors.color && "Required"}
                          label="Color"
                          name="color"
                        />
                      )}
                    />
                  )}
                />
                <Controller
                  control={control}
                  {...register("style", { required: true })}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      onChange={(_event, newValue) => field.onChange(newValue)}
                      size="small"
                      options={styleData?.map(style => style.style_no) || []}
                      sx={{ flex: 1, margin: "0.5rem" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.style}
                          helperText={errors.style && "Required"}
                          label="Style"
                          name="style"
                        />
                      )}
                    />
                  )}
                />
                <Controller
                  control={control}
                  {...register("size", { required: true })}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      onChange={(_event, newValue) => field.onChange(newValue)}
                      size="small"
                      options={sizeData?.map(size => size.description) || []}
                      sx={{ flex: 1, margin: "0.5rem" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.style}
                          helperText={errors.style && "Required"}
                          label="Size"
                          name="size"
                        />
                      )}
                    />
                  )}
                />
                <Controller
                  control={control}
                  {...register("checkPoint", { required: true })}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      onChange={(_event, newValue) => field.onChange(newValue)}
                      size="small"
                      options={sizeData?.map(checkPoint => checkPoint.description) || []}
                      sx={{ flex: 1, margin: "0.5rem" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.checkPoint}
                          helperText={errors.checkPoint && "Required"}
                          label="Check Point"
                          name="checkPoint"
                        />
                      )}
                    />
                  )}
                />
              </Stack>

              {/* Status Cards */}
              {loading.data ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress size={40} />
                </Box>
              ) : (
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
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
                    <Box key={index} sx={{ width: { xs: '100%', md: '33%' } }}>
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
                    </Box>
                  ))}
                </Stack>
              )}

              {/* Hourly Boxes */}
              <Stack
                direction="row"
                flexWrap="initial"
                spacing={2}
                useFlexGap
                sx={{ width: '100%', mt: 3 }}
              >
                {data.hourlyData.map((value, index) => (
                  <Box key={index} sx={{ width: { xs: '90%', sm: '48%', md: '23%', lg: '15%' } }}>
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
                  </Box>
                ))}
              </Stack>
            </Card>
          )}
        </Box>

        {/* Rework Dialog */}
        <Dialog
          open={dialogOpen.rework}
          onClose={() => handleDialogClose('rework')}
          sx={{
            '& .MuiDialog-paper': {
              width: '300px',
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