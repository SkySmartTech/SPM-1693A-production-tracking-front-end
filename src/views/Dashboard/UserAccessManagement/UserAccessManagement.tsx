import { useState, useEffect } from "react";
import {
    Box, Button, Checkbox, CircularProgress, FormControlLabel, FormGroup,
    MenuItem, Select, Typography, SelectChangeEvent,
    AppBar, Toolbar, IconButton,
    Snackbar, Alert, Paper, Accordion, AccordionSummary,
    AccordionDetails, Divider,
    CssBaseline,
    useTheme
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Sidebar from "../../../components/Sidebar";
import { Menu, Badge } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useCustomTheme } from "../../../context/ThemeContext";


// Mock data for initial display
const mockRoles = [
    {
        name: "Admin",
        description: "Full system access",
        type: "admin" as const,
        permissions: {
            adminDashboard: true,
            userManagement: true,
            roleManagement: true,
            systemSettings: true,
            auditLogs: true,
            backupRestore: true,
            apiManagement: true,
            reportGeneration: true,
            dataExport: true,
            systemMonitoring: true,
            managerDashboard: false,
            workOrderManagement: false,
            teamManagement: false,
            performanceReports: false,
            inventoryView: false,
            maintenanceScheduling: false,
            costAnalysis: false,
            kpiMonitoring: false,
            documentManagement: false,
            approvalWorkflows: false,
            supplierDashboard: false,
            partsCatalog: false,
            orderManagement: false,
            deliveryTracking: false,
            invoiceSubmission: false,
            inventoryManagement: false,
            contractView: false,
            serviceRequests: false,
            complianceDocuments: false,
            performanceMetrics: false
        }
    },
    {
        name: "Manager",
        description: "Team management access",
        type: "manager" as const,
        permissions: {
            adminDashboard: false,
            userManagement: false,
            roleManagement: false,
            systemSettings: false,
            auditLogs: false,
            backupRestore: false,
            apiManagement: false,
            reportGeneration: false,
            dataExport: false,
            systemMonitoring: false,
            managerDashboard: true,
            workOrderManagement: true,
            teamManagement: true,
            performanceReports: true,
            inventoryView: true,
            maintenanceScheduling: true,
            costAnalysis: true,
            kpiMonitoring: true,
            documentManagement: true,
            approvalWorkflows: true,
            supplierDashboard: false,
            partsCatalog: false,
            orderManagement: false,
            deliveryTracking: false,
            invoiceSubmission: false,
            inventoryManagement: false,
            contractView: false,
            serviceRequests: false,
            complianceDocuments: false,
            performanceMetrics: false
        }
    },
    {
        name: "Supplier",
        description: "Vendor access",
        type: "supplier" as const,
        permissions: {
            adminDashboard: false,
            userManagement: false,
            roleManagement: false,
            systemSettings: false,
            auditLogs: false,
            backupRestore: false,
            apiManagement: false,
            reportGeneration: false,
            dataExport: false,
            systemMonitoring: false,
            managerDashboard: false,
            workOrderManagement: false,
            teamManagement: false,
            performanceReports: false,
            inventoryView: false,
            maintenanceScheduling: false,
            costAnalysis: false,
            kpiMonitoring: false,
            documentManagement: false,
            approvalWorkflows: false,
            supplierDashboard: true,
            partsCatalog: true,
            orderManagement: true,
            deliveryTracking: true,
            invoiceSubmission: true,
            inventoryManagement: true,
            contractView: true,
            serviceRequests: true,
            complianceDocuments: true,
            performanceMetrics: true
        }
    }
];

interface Permissions {
    adminDashboard: boolean;
    userManagement: boolean;
    roleManagement: boolean;
    systemSettings: boolean;
    auditLogs: boolean;
    backupRestore: boolean;
    apiManagement: boolean;
    reportGeneration: boolean;
    dataExport: boolean;
    systemMonitoring: boolean;
    managerDashboard: boolean;
    workOrderManagement: boolean;
    teamManagement: boolean;
    performanceReports: boolean;
    inventoryView: boolean;
    maintenanceScheduling: boolean;
    costAnalysis: boolean;
    kpiMonitoring: boolean;
    documentManagement: boolean;
    approvalWorkflows: boolean;
    supplierDashboard: boolean;
    partsCatalog: boolean;
    orderManagement: boolean;
    deliveryTracking: boolean;
    invoiceSubmission: boolean;
    inventoryManagement: boolean;
    contractView: boolean;
    serviceRequests: boolean;
    complianceDocuments: boolean;
    performanceMetrics: boolean;
}

interface Role {
    name: string;
    description: string;
    type: 'admin' | 'manager' | 'supplier';
    permissions: Permissions;
}

const UserAccessManagementSystem = () => {
    const [roles, setRoles] = useState<Role[]>(mockRoles);
    const [selectedRole, setSelectedRole] = useState<string>("Admin");
    const [roleDescription, setRoleDescription] = useState<string>("Full system access");
    const [roleType, setRoleType] = useState<'admin' | 'manager' | 'supplier'>('admin');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [] = useState(false);
    const [loading, setLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
    const [notificationCount] = useState(3);
    const navigate = useNavigate(); // Navigation hook
    const [permissions, setPermissions] = useState<Permissions>(mockRoles[0].permissions);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error"
    });
      const theme = useTheme();
      useCustomTheme();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Uncomment for production:
                // const response = await axios.get<Role[]>("/api/roles");
                // const data = response.data;
                // setRoles(data.length > 0 ? data : mockRoles);
                // if (data.length > 0) {
                //     setSelectedRole(data[0].name);
                //     setRoleDescription(data[0].description);
                //     setRoleType(data[0].type);
                //     setPermissions(data[0].permissions);
                // }
            } catch (error) {
                console.error("Error fetching roles:", error);
                showSnackbar("Failed to fetch roles", "error");
                setRoles(mockRoles);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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

    const handleRoleChange = (event: SelectChangeEvent<string>) => {
        const roleName = event.target.value;
        setSelectedRole(roleName);
        const role = roles.find(r => r.name === roleName);
        if (role) {
            setRoleDescription(role.description);
            setRoleType(role.type);
            setPermissions(role.permissions);
        }
    };

    const handlePermissionChange = (permission: keyof Permissions) =>
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setPermissions(prev => ({
                ...prev,
                [permission]: event.target.checked
            }));
        };

    const handleUpdate = async () => {
        try {
            setLoading(true);
            // Uncomment for production:
            // await axios.put(`/api/roles/${selectedRole}`, { permissions });
            showSnackbar("Permissions updated successfully!", "success");
        } catch (error) {
            console.error("Error updating permissions:", error);
            showSnackbar("Failed to update permissions", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleNew = async () => {
        const newRoleName = prompt("Enter new role name:");
        if (newRoleName) {
            const newRoleType = prompt("Enter role type (admin, manager, or supplier):");
            if (newRoleType === 'admin' || newRoleType === 'manager' || newRoleType === 'supplier') {
                try {
                    setLoading(true);
                    // Uncomment for production:
                    // await axios.post("/api/roles", { 
                    //     name: newRoleName,
                    //     type: newRoleType,
                    //     description: "",
                    //     permissions: mockRoles.find(r => r.type === newRoleType)?.permissions || mockRoles[0].permissions
                    // });

                    const newRole: Role = {
                        name: newRoleName,
                        type: newRoleType,
                        description: "",
                        permissions: mockRoles.find(r => r.type === newRoleType)?.permissions || mockRoles[0].permissions
                    };

                    setRoles([...roles, newRole]);
                    setSelectedRole(newRoleName);
                    setRoleDescription(newRole.description);
                    setRoleType(newRoleType);
                    setPermissions(newRole.permissions);

                    showSnackbar("New role added successfully!", "success");
                } catch (error) {
                    console.error("Error adding role:", error);
                    showSnackbar("Failed to add new role", "error");
                } finally {
                    setLoading(false);
                }
            } else {
                showSnackbar("Invalid role type. Must be admin, manager, or supplier", "error");
            }
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this role?")) {
            try {
                setLoading(true);
                // Uncomment for production:
                // await axios.delete(`/api/roles/${selectedRole}`);

                const updatedRoles = roles.filter(r => r.name !== selectedRole);
                setRoles(updatedRoles);

                if (updatedRoles.length > 0) {
                    setSelectedRole(updatedRoles[0].name);
                    setRoleDescription(updatedRoles[0].description);
                    setRoleType(updatedRoles[0].type);
                    setPermissions(updatedRoles[0].permissions);
                } else {
                    setSelectedRole("");
                    setRoleDescription("");
                    setPermissions(mockRoles[0].permissions);
                }

                showSnackbar("Role deleted successfully!", "success");
            } catch (error) {
                console.error("Error deleting role:", error);
                showSnackbar("Failed to delete role", "error");
            } finally {
                setLoading(false);
            }
        }
    };

    const renderAdminPermissions = () => (
        <Accordion defaultExpanded={roleType === 'admin'}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Admin Permissions</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <FormGroup>
                    {Object.entries(permissions)
                        .filter(([key]) => key.includes('admin') ||
                            ['userManagement', 'roleManagement', 'systemSettings', 'auditLogs',
                                'backupRestore', 'apiManagement', 'reportGeneration',
                                'dataExport', 'systemMonitoring'].includes(key))
                        .map(([key, value]) => (
                            <FormControlLabel
                                key={key}
                                control={
                                    <Checkbox
                                        checked={value as boolean}
                                        onChange={handlePermissionChange(key as keyof Permissions)}
                                    />
                                }
                                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            />
                        ))}
                </FormGroup>
            </AccordionDetails>
        </Accordion>
    );

    const renderManagerPermissions = () => (
        <Accordion defaultExpanded={roleType === 'manager'}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Manager Permissions</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <FormGroup>
                    {Object.entries(permissions)
                        .filter(([key]) => key.includes('manager') ||
                            ['workOrderManagement', 'teamManagement', 'performanceReports',
                                'inventoryView', 'maintenanceScheduling', 'costAnalysis',
                                'kpiMonitoring', 'documentManagement', 'approvalWorkflows'].includes(key))
                        .map(([key, value]) => (
                            <FormControlLabel
                                key={key}
                                control={
                                    <Checkbox
                                        checked={value as boolean}
                                        onChange={handlePermissionChange(key as keyof Permissions)}
                                    />
                                }
                                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            />
                        ))}
                </FormGroup>
            </AccordionDetails>
        </Accordion>
    );

    const renderSupplierPermissions = () => (
        <Accordion defaultExpanded={roleType === 'supplier'}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Supplier Permissions</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <FormGroup>
                    {Object.entries(permissions)
                        .filter(([key]) => key.includes('supplier') ||
                            ['partsCatalog', 'orderManagement', 'deliveryTracking',
                                'invoiceSubmission', 'inventoryManagement', 'contractView',
                                'serviceRequests', 'complianceDocuments', 'performanceMetrics'].includes(key))
                        .map(([key, value]) => (
                            <FormControlLabel
                                key={key}
                                control={
                                    <Checkbox
                                        checked={value as boolean}
                                        onChange={handlePermissionChange(key as keyof Permissions)}
                                    />
                                }
                                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            />
                        ))}
                </FormGroup>
            </AccordionDetails>
        </Accordion>
    );

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
                            User Access Management
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

                <Box sx={{ p: 3 }}>
                    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", width: "100%" }}>
                            <Typography>User Role:</Typography>
                            <Select
                                value={selectedRole}
                                onChange={handleRoleChange}
                                sx={{ minWidth: 200 }}
                                displayEmpty
                            >
                                {roles.map((role) => (
                                    <MenuItem key={role.name} value={role.name}>
                                        {role.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            <Box sx={{ display: "flex", gap: 2, marginLeft: "auto" }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleUpdate}
                                    disabled={!selectedRole || loading}
                                    sx={{ minWidth: 100 }}
                                >
                                    {loading ? <CircularProgress size={24} /> : "Update"}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleNew}
                                    disabled={loading}
                                    sx={{ minWidth: 100 }}
                                >
                                    New
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleDelete}
                                    disabled={!selectedRole || loading}
                                    sx={{ minWidth: 100 }}
                                >
                                    Delete
                                </Button>
                            </Box>
                        </Box>

                        {selectedRole && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1">
                                    <strong>Role Type:</strong> {roleType.charAt(0).toUpperCase() + roleType.slice(1)}
                                </Typography>
                                <Typography variant="subtitle1">
                                    <strong>Description:</strong> {roleDescription || "No description available"}
                                </Typography>
                            </Box>
                        )}
                    </Paper>

                    {selectedRole ? (
                        <Paper elevation={3} sx={{ p: 3 }}>
                            <Typography variant="h5" sx={{ mb: 2 }}>Role Permissions</Typography>
                            <Divider sx={{ mb: 3 }} />

                            {renderAdminPermissions()}
                            {renderManagerPermissions()}
                            {renderSupplierPermissions()}
                        </Paper>
                    ) : (
                        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="h6">Please select a role to view or edit permissions</Typography>
                        </Paper>
                    )}
                </Box>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
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

export default UserAccessManagementSystem;