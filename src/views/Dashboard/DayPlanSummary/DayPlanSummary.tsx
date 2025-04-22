import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Stack,
  Grid,
  Card,
  CardContent,
  Divider,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import Sidebar from "../../../components/Sidebar";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import PrintIcon from "@mui/icons-material/Print";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import axios from "axios";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Footer from "../../../components/Footer";
import { Menu, MenuItem, Badge } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface ReportData {
  id: number;
  serverDateTime: string;
  lineNo: string;
  buyer: string;
  style: string;
  color: string;
  size: string;
  success: number;
  rework: number;
  defect: number;
}

interface PerformanceMetrics {
  performanceEfi: number;
  lineEfi: number;
  totalSuccess: number;
  totalRework: number;
  totalDefect: number;
  topDefects: string[];
}

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 80 },
  { field: "serverDateTime", headerName: "Server Date Time", width: 180 },
  { field: "lineNo", headerName: "Line No", width: 100 },
  { field: "buyer", headerName: "Buyer", width: 120 },
  { field: "style", headerName: "Style", width: 120 },
  { field: "color", headerName: "Color", width: 100 },
  { field: "size", headerName: "Size", width: 80 },
  { field: "success", headerName: "Success", width: 100, type: 'number' },
  { field: "rework", headerName: "Rework", width: 100, type: 'number' },
  { field: "defect", headerName: "Defect", width: 100, type: 'number' },
];

const DayPlanReport = () => {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [rows, setRows] = useState<ReportData[]>([]);
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
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    performanceEfi: 0,
    lineEfi: 0,
    totalSuccess: 0,
    totalRework: 0,
    totalDefect: 0,
    topDefects: []
  });

  // Fetch initial data when component mounts
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch both reports and metrics in parallel
      const [reportsResponse, metricsResponse] = await Promise.all([
        axios.get<ReportData[]>("http://localhost:8000/api/day-plans"),
        axios.get<PerformanceMetrics>("http://localhost:8000/api/performance-metrics")
      ]);
      
      setRows(reportsResponse.data);
      setPerformanceMetrics(metricsResponse.data);
      showSnackbar("Data loaded successfully", "success");
    } catch (error) {
      console.error("Error fetching initial data:", error);
      showSnackbar("Failed to load initial data", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .catch(err => console.error('Error attempting to enable fullscreen:', err));
    } else {
      document.exitFullscreen()
        .catch(err => console.error('Error attempting to exit fullscreen:', err));
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
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

  const fetchReports = async () => {
    if (!startDate || !endDate) {
      showSnackbar("Please select both start and end dates.", "error");
      return;
    }

    try {
      setLoading(true);
      // Fetch both reports and metrics in parallel
      const [reportsResponse, metricsResponse] = await Promise.all([
        axios.get<ReportData[]>("http://localhost:8000/api/dayplan-reports", {
          params: {
            start_date: startDate.format('YYYY-MM-DD'),
            end_date: endDate.format('YYYY-MM-DD'),
          },
        }),
        axios.get<PerformanceMetrics>("http://localhost:8000/api/performance-metrics", {
          params: {
            start_date: startDate.format('YYYY-MM-DD'),
            end_date: endDate.format('YYYY-MM-DD'),
          },
        })
      ]);
      
      setRows(reportsResponse.data);
      setPerformanceMetrics(metricsResponse.data);
      showSnackbar("Reports fetched successfully", "success");
    } catch (error) {
      console.error("Error fetching reports:", error);
      showSnackbar("Failed to fetch reports", "error");
    } finally {
      setLoading(false);
    }
  };

  // Laravel backend API endpoints would look something like this:
  /*
  // routes/api.php
  Route::get('/day-plans', [DayPlanController::class, 'index']);
  Route::get('/dayplan-reports', [DayPlanController::class, 'reports']);
  Route::get('/performance-metrics', [PerformanceMetricsController::class, 'index']);

  // App/Http/Controllers/DayPlanController.php
  public function index(Request $request) {
    return DayPlan::orderBy('serverDateTime', 'desc')->limit(100)->get();
  }

  public function reports(Request $request) {
    $query = DayPlan::query();
    
    if ($request->has('start_date') && $request->has('end_date')) {
      $query->whereBetween('serverDateTime', [
        $request->start_date,
        $request->end_date
      ]);
    }
    
    return $query->orderBy('serverDateTime', 'desc')->get();
  }

  // App/Http/Controllers/PerformanceMetricsController.php
  public function index(Request $request) {
    $query = DayPlan::query();
    
    if ($request->has('start_date') && $request->has('end_date')) {
      $query->whereBetween('serverDateTime', [
        $request->start_date,
        $request->end_date
      ]);
    }
    
    $data = $query->get();
    
    return [
      'performanceEfi' => $data->avg('success') / ($data->avg('success') + $data->avg('rework') + $data->avg('defect')) * 100,
      'lineEfi' => $data->sum('success') / ($data->sum('success') + $data->sum('rework') + $data->sum('defect')) * 100,
      'totalSuccess' => $data->sum('success'),
      'totalRework' => $data->sum('rework'),
      'totalDefect' => $data->sum('defect'),
      'topDefects' => $data->groupBy('defect')->sortDesc()->keys()->take(3)->toArray()
    ];
  }
  */

  return (
    <Box sx={{ display: "full", width: "95vw", height: "100vh", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen || hovered}
        setOpen={setSidebarOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* AppBar */}
        <AppBar position="static" sx={{ bgcolor: "white", boxShadow: 2 }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MenuIcon sx={{ color: "black" }} />
            </IconButton>

            <Typography variant="h6" sx={{ flexGrow: 1, color: "black" }}>
              Day Plan Report
            </Typography>

            {/* Icons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {/* Notifications dropdown */}
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

              {/* Account dropdown menu */}
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
          <Typography variant="h6" sx={{ mb: 2 }}>
            Details
          </Typography>

          {/* Performance Metrics Boxes */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Performance EFI
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h5" component="div">
                      {performanceMetrics.performanceEfi.toFixed(2)}%
                    </Typography>
                    <TrendingUpIcon color={performanceMetrics.performanceEfi > 0 ? "success" : "error"} sx={{ ml: 1 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {performanceMetrics.performanceEfi > 0 ? "More than yesterday" : "Less than yesterday"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    LINE EFI
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h5" component="div">
                      {performanceMetrics.lineEfi.toFixed(2)}%
                    </Typography>
                    <TrendingUpIcon color={performanceMetrics.lineEfi > 0 ? "success" : "error"} sx={{ ml: 1 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {performanceMetrics.lineEfi > 0 ? "More than yesterday" : "Less than yesterday"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Total Success
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h5" component="div">
                      {performanceMetrics.totalSuccess}
                    </Typography>
                    <TrendingUpIcon color="success" sx={{ ml: 1 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    More than yesterday
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Total Rework
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h5" component="div">
                      {performanceMetrics.totalRework}
                    </Typography>
                    <TrendingUpIcon color="error" sx={{ ml: 1 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    More than yesterday
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Total Defect
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h5" component="div">
                      {performanceMetrics.totalDefect}
                    </Typography>
                    <TrendingUpIcon color="error" sx={{ ml: 1 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    More than yesterday
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    TOP 3 DEFECTS
                  </Typography>
                  <Typography variant="h5" component="div">
                    {performanceMetrics.topDefects.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {performanceMetrics.topDefects.map((defect, index) => (
                      <div key={index}>{index + 1}. {defect}</div>
                    ))}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Date Pickers & View Reports */}
          <Box
            sx={{
              backgroundColor: "#ffffff",
              padding: 2,
              borderRadius: 1,
              mb: 3,
              boxShadow: 1
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue: Dayjs | null) => setStartDate(newValue)}
                    slotProps={{
                      textField: {
                        variant: 'outlined',
                        fullWidth: true,
                        size: 'small'
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue: Dayjs | null) => setEndDate(newValue)}
                    slotProps={{
                      textField: {
                        variant: 'outlined',
                        fullWidth: true,
                        size: 'small'
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={fetchReports}
                  sx={{ height: '40px' }}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? "Loading..." : "View Reports"}
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Export Buttons */}
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mb: 1 }}>
            <Button startIcon={<FileCopyIcon />} size="small">
              Copy
            </Button>
            <Button startIcon={<PrintIcon />} size="small">
              Print
            </Button>
            <Button startIcon={<FileDownloadIcon />} size="small">
              Excel
            </Button>
            <Button startIcon={<FileDownloadIcon />} size="small">
              CSV
            </Button>
            <Button startIcon={<FileDownloadIcon />} size="small">
              PDF
            </Button>
          </Stack>

          {/* DataGrid Table */}
          <Box sx={{ height: 500, backgroundColor: "#fff", p: 2, borderRadius: 1, boxShadow: 1 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 25]}
              checkboxSelection
              loading={loading}
            />
          </Box>
        </Box>
        <Footer />
      </Box>

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
  );
};

export default DayPlanReport;