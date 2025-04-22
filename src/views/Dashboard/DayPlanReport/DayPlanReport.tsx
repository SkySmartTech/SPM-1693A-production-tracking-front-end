import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Typography,
    AppBar,
    Toolbar,
    IconButton,
    Stack,
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

const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "serverDateTime", headerName: "Server Date Time", width: 150 },
    { field: "lineNo", headerName: "Line No", width: 120 },
    { field: "buyer", headerName: "Buyer", width: 150 },
    { field: "style", headerName: "Style", width: 120 },
    { field: "color", headerName: "Color", width: 100 },
    { field: "size", headerName: "Size", width: 90 },
    { field: "success", headerName: "Success", width: 100, type: 'number' },
    { field: "rework", headerName: "Rework", width: 120, type: 'number' },
    { field: "defect", headerName: "Defect", width: 130, type: 'number' },
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

    // Fetch initial data when component mounts
    useEffect(() => {
        fetchData();
    }, []);

    // Fetch data from API
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axios.get("http://localhost:8000/api/day-plans");
            setRows(response.data);
            showSnackbar("Data loaded successfully", "success");
        } catch (error) {
            console.error("Error fetching data:", error);
            showSnackbar("Failed to load data", "error");
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
            const response = await axios.get<ReportData[]>(
                "http://localhost:8000/api/dayplan-reports",
                {
                    params: {
                        start_date: startDate.format('YYYY-MM-DD'),
                        end_date: endDate.format('YYYY-MM-DD'),
                    },
                }
            );
            setRows(response.data);
            showSnackbar("Reports fetched successfully", "success");
        } catch (error) {
            console.error("Error fetching reports:", error);
            showSnackbar("Failed to fetch reports", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: "full", width: "95vw", height: "100vh", minHeight: "100vh", backgroundColor: "#D8DBDE" }}>
            <Sidebar
                open={sidebarOpen || hovered}
                setOpen={setSidebarOpen}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            />

            <Box sx={{ flexGrow: 1, bgcolor: "#D8DBDE" }}>
                <AppBar position="static" sx={{ bgcolor: "white", boxShadow: 2 }}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <MenuIcon sx={{ color: "black" }} />
                        </IconButton>

                        <Typography variant="h6" sx={{ flexGrow: 1, color: "black" }}>
                            Day Plan Report
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

                <Box sx={{ backgroundColor: "#D8DBDE", p: 2, borderRadius: 1 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Details
                    </Typography>

                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                            backgroundColor: "#fff",
                            padding: 2,
                            borderRadius: 3,
                            mb: 3,
                            alignItems: 'center',
                        }}
                    >
                        <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Start Date"
                                    value={startDate}
                                    sx={{ width: "300px" }}
                                    onChange={(newValue) => setStartDate(newValue)}
                                    slotProps={{
                                        textField: {
                                            variant: 'outlined',
                                            fullWidth: true
                                        }
                                    }}
                                />

                                <DatePicker
                                    label="End Date"
                                    value={endDate}
                                    sx={{ width: "300px" }}
                                    onChange={(newValue) => setEndDate(newValue)}
                                    slotProps={{
                                        textField: {
                                            variant: 'outlined',
                                            fullWidth: true
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Stack>

                        <Box>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={fetchReports}
                                sx={{ ml: 'auto', height: "50px" }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : "View Reports"}
                            </Button>
                        </Box>
                    </Stack>

                    <Box sx={{ height: 500, backgroundColor: "#fff", p: 2, borderRadius: 3 }}>
                        <Stack direction="row" spacing={0.8} justifyContent="flex-end" sx={{ mb: 0.5 }}>
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
            </Box>
            <Footer />

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