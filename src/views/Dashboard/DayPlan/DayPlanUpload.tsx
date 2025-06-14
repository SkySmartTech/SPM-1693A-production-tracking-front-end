import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  CssBaseline,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Sidebar from "../../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import Badge from '@mui/material/Badge';
import { useQuery } from "@tanstack/react-query";
import { useCustomTheme } from "../../../context/ThemeContext";
import { fetchDayPlans, uploadDayPlanFile, DayPlan } from "../../../api/dayPlanApi";

const DayPlanUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationCount] = useState(3);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info'
  });
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  useCustomTheme();

  // Fetch data using React Query
  const { data: dayPlansData = [], isLoading, isError, refetch } = useQuery<DayPlan[]>({
    queryKey: ["day-plans"],
    queryFn: fetchDayPlans
  });

  const handleAuthError = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
    setSnackbar({
      open: true,
      message: 'Session expired. Please login again.',
      severity: 'error'
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setSnackbar({
        open: true,
        message: 'Please select a file first',
        severity: 'error'
      });
      return;
    }

    try {
      setUploading(true);
      setSnackbar({
        open: true,
        message: 'Uploading file...',
        severity: 'info'
      });

      const result = await uploadDayPlanFile(file);
      
      setSnackbar({
        open: true,
        message: result.message,
        severity: result.success ? 'success' : 'error'
      });

      if (result.success) {
        setFile(null);
        await refetch();
      }
    } catch (error) {
      let errorMessage = 'An error occurred during upload';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes('authentication')) {
          handleAuthError();
          return;
        }
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadSample = () => {
    const sampleData = [
      {
        line_no: "1",
        resp_employee: "EMP001",
        buyer: "Buyer1",
        style: "Style1",
        gg: "GG1",
        smv: "2.5",
        display_wh: "8",
        actual_wh: "8",
        plan_tgt_pcs: "1000",
        per_hour_pcs: "125",
        available_cader: "50",
        present_linkers: "45",
        check_point: "Check1",
        status: "Active"
      }
    ];

    const headers = Object.keys(sampleData[0]);
    const csvRows = sampleData.map(row => 
      headers.map(fieldName => 
        JSON.stringify(row[fieldName as keyof typeof row])
      ).join(',')
    );
    const csvContent = [headers.join(','), ...csvRows].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'day_plan_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: GridColDef<DayPlan>[] = [
    { field: "id", headerName: "ID", width: 60 },
    { field: "line_no", headerName: "Line No", width: 50 },
    { field: "resp_employee", headerName: "Resp Employee", width: 100 },
    { field: "buyer", headerName: "Buyer", width: 80 },
    { field: "style", headerName: "Style", width: 80 },
    { field: "gg", headerName: "GG", width: 60 },
    { field: "smv", headerName: "SMV", width: 80 },
    { field: "display_wh", headerName: "Display WH", width: 90 },
    { field: "actual_wh", headerName: "Actual WH", width: 90 },
    { field: "plan_tgt_pcs", headerName: "Plan Tgt Pcs", width: 100 },
    { field: "per_hour_pcs", headerName: "Per Hour Pcs", width: 100 },
    { field: "available_cader", headerName: "Available Cader", width: 120 },
    { field: "present_linkers", headerName: "Present Linkers", width: 100 },
    { field: "check_point", headerName: "Check Point", width: 90 },
    { field: "status", headerName: "Status", width: 90 },
    { field: "created_at", headerName: "Created At", width: 90 },
    { field: "updated_at", headerName: "Updated At", width: 90 },
  ];

  // Menu handlers (same as before)
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
    localStorage.removeItem('authToken');
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

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh", minHeight: "100vh", bgcolor: theme.palette.background.default }}>
      <CssBaseline />
      <Sidebar
        open={sidebarOpen || hovered}
        setOpen={setSidebarOpen}
        
      />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AppBar position="static" sx={{ 
          bgcolor: theme.palette.background.paper, 
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary
        }}>
          <Toolbar>
            <IconButton 
              edge="start" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Day Plan Upload
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton onClick={handleNotificationMenuOpen} color="inherit">
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

              <IconButton 
                onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()}
                color="inherit"
              >
                <FullscreenIcon />
              </IconButton>

              <IconButton onClick={handleAccountMenuOpen} color="inherit">
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

        <Box sx={{ 
          padding: 5, 
          borderRadius: "8px", 
          marginBottom: 5,
          bgcolor: theme.palette.background.paper,
          flexGrow: 1
        }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 5, color: theme.palette.text.primary }}>
            Day Plan Upload
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 5 }}>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="file-input"
              disabled={uploading}
            />
            <label htmlFor="file-input">
              <Button 
                variant="contained" 
                component="span" 
                sx={{ 
                  backgroundColor: theme.palette.mode === 'light' ? "#FFD900" : "#FFC107",
                  color: "black", 
                  "&:hover": { 
                    backgroundColor: theme.palette.mode === 'light' ? "#E6C200" : "#FFA000" 
                  }
                }}
                disabled={uploading}
              >
                Choose File
              </Button>
            </label>
            <Typography color="text.primary">{file ? file.name : "No file chosen"}</Typography>

            <Box sx={{ flexGrow: 1 }} />

            <Button 
              variant="outlined" 
              onClick={handleDownloadSample}
              sx={{ marginRight: 2 }}
              disabled={uploading}
            >
              Download Sample
            </Button>

            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleUpload}
              disabled={!file || uploading}
              endIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </Box>
          <Box sx={{ 
            height: 400, 
            width: "100%",  
            borderRadius: "8px", 
            overflowX: "auto",
            bgcolor: theme.palette.background.paper
          }}>
            {isLoading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                color: theme.palette.text.primary
              }}>
                <CircularProgress />
              </Box>
            ) : isError ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%'
              }}>
                <Typography color="error">Error loading data</Typography>
              </Box>
            ) : (
              <DataGrid
                rows={dayPlansData}
                columns={columns}
                pageSizeOptions={[5, 10, 20]}
                sx={{
                  '& .MuiDataGrid-cell': {
                    color: theme.palette.text.primary
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.primary
                  }
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DayPlanUpload;