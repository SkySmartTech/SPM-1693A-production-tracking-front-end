import React, { useState } from "react";
import {
  Box, Typography, Button, AppBar, Toolbar, IconButton,
  CssBaseline, Menu, MenuItem,
  Divider,
  useTheme
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import axios from "axios";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Sidebar from "../../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import Badge from '@mui/material/Badge';
import { fetchDayPlans } from "../../../api/dayPlansApi";
import { useQuery } from "@tanstack/react-query";
import { useCustomTheme } from "../../../context/ThemeContext";

const DayPlanUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationCount] = useState(3);
  const navigate = useNavigate();

  // Fetch data using React Query
  const { data: dayPlansData, isLoading, isError } = useQuery({
    queryKey: ["day-plans"],
    queryFn: fetchDayPlans,
  });
    const theme = useTheme();
    useCustomTheme();

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        alert("File uploaded successfully!");
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred.");
    }
  };

  // Handle sample file download
  const handleDownloadSample = () => {
    // Create a sample Excel file structure
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

    // Convert to CSV format (Excel can open CSV files)
    const headers = Object.keys(sampleData[0]);
    const csvRows = sampleData.map(row => 
      headers.map(fieldName => 
        JSON.stringify(row[fieldName as keyof typeof row])
      ).join(',')
    );
    const csvContent = [headers.join(','), ...csvRows].join('\r\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'day_plan_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Define DataGrid columns
  const columns: GridColDef[] = [
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
        <AppBar position="static" sx={{ bgcolor: theme.palette.background.paper, boxShadow: 2 }}>
          <Toolbar>
            <IconButton edge="start" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, color: theme.palette.text.primary }}>
              Day Plan Upload
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
        {/* Content */}
        <Box sx={{ padding: 5, borderRadius: "8px", marginBottom: 5 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 5 }}>
            Day Plan Upload
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 5 }}>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="file-input"
            />
            <label htmlFor="file-input">
              <Button variant="contained" component="span" sx={{ backgroundColor: "#FFD900", color: "black", "&:hover": { backgroundColor: "#E6C200" } }}>
                Choose File
              </Button>
            </label>
            <Typography>{file ? file.name : "No file chosen"}</Typography>

            {/* Spacer to push buttons to the right */}
            <Box sx={{ flexGrow: 1 }} />

            <Button 
              variant="outlined" 
              onClick={handleDownloadSample}
              sx={{ marginRight: 2 }}
            >
              Download Sample
            </Button>

            <Button variant="contained" color="primary" onClick={handleUpload}>
              Upload
            </Button>
          </Box>
          <Box sx={{ height: 400, width: "100%",  borderRadius: "8px", overflowX: "auto" }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography>Loading data...</Typography>
              </Box>
            ) : isError ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="error">Error loading data</Typography>
              </Box>
            ) : (
              <DataGrid
                rows={dayPlansData || []}
                columns={columns}
                pageSizeOptions={[5, 10, 20]}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DayPlanUpload;