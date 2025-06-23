import { useState, useEffect } from "react";
import {
  Box, Button, Checkbox, CircularProgress, FormControlLabel,
  FormGroup, MenuItem, Select, Typography, SelectChangeEvent,
  AppBar, Snackbar, Alert, Paper, CssBaseline, TextField, Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import Sidebar from "../../../components/Sidebar";
import { useCustomTheme } from "../../../context/ThemeContext";
import Navbar from "../../../components/Navbar";
import { useTheme } from "@mui/material/styles";
import {
  fetchUserTypes,
  fetchUserRoles,
  createUserRole,
  updateUserRole,
  deleteUserRole,
  createUserAccess,
  UserRole,
  UserType,
  PermissionKey
} from "../../../api/userAccessmanagementApi";

// Create a type-safe default permissions object
const defaultPermissions: Record<PermissionKey, boolean> = {
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
  partsCatalog: false,
  orderManagement: false,
  deliveryTracking: false,
  invoiceSubmission: false,
  inventoryManagement: false,
  contractView: false,
  serviceRequests: false,
  complianceDocuments: false,
  performanceMetrics: false,
};

const UserAccessManagementSystem = () => {
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [roleDescription, setRoleDescription] = useState<string>("");
  const [, setUserType] = useState<string>("");
  // Initialize permissions with defaultPermissions
  const [permissions, setPermissions] = useState<Record<PermissionKey, boolean>>(defaultPermissions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  useCustomTheme();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error"
  });

  // Define the type for the new role form
  type NewRoleForm = {
    name: string;
    userType: string;
  };

  const [newRoleDialog, setNewRoleDialog] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState<NewRoleForm>({
    name: '',
    userType: ''
  });

  // Add error handling for data loading
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [types, fetchedRoles] = await Promise.all([
        fetchUserTypes(),
        fetchUserRoles()
      ]);

      setUserTypes(types || []);
      setRoles(fetchedRoles || []);
      
      if (fetchedRoles && fetchedRoles.length > 0) {
        const firstRole = fetchedRoles[0];
        setSelectedRole(firstRole.name);
        setSelectedRoleId(firstRole.id);
        setRoleDescription(firstRole.description);
        setUserType(firstRole.userType);
        // Ensure permissions are never undefined
        setPermissions(firstRole.permissionObject || defaultPermissions);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading data';
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Update the permissions handling in the role change effect
  useEffect(() => {
    const role = roles.find(r => r.name === selectedRole);
    if (role) {
      setSelectedRoleId(role.id);
      setRoleDescription(role.description);
      setUserType(role.userType);
      // Ensure permissions are never undefined
      setPermissions(role.permissionObject || defaultPermissions);
    }
  }, [selectedRole, roles]);

  const handlePermissionChange = (key: PermissionKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPermissions(prev => ({ ...prev, [key]: e.target.checked }));
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleRoleChange = (e: SelectChangeEvent<string>) => {
    setSelectedRole(e.target.value);
  };

  const handleUpdate = async () => {
    if (!selectedRoleId) return;
    
    setLoading(true);
    try {
      await updateUserRole(selectedRoleId, {
        description: roleDescription,
        permissionObject: permissions
      });
      await loadData();
      showSnackbar("Role updated successfully!", "success");
    } catch (error) {
      showSnackbar("Failed to update role", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setNewRoleForm({ name: '', userType: '' });
    setNewRoleDialog(true);
  };

  const handleCreateRole = async () => {
    if (!newRoleForm.name || !newRoleForm.userType) {
      showSnackbar("Please fill all fields", "error");
      return;
    }

    setLoading(true);
    try {
      const newRole = await createUserRole({
        name: newRoleForm.name,
        userType: newRoleForm.userType,
        description: "",
        permissionObject: defaultPermissions
      });
      
      await createUserAccess({
        userType: newRoleForm.userType,
        description: "",
        permissionObject: defaultPermissions
      });
      
      await loadData();
      setSelectedRole(newRole.name);
      showSnackbar("New role created successfully!", "success");
      setNewRoleDialog(false);
    } catch (error) {
      showSnackbar("Failed to create role", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRoleId || !window.confirm("Are you sure you want to delete this role?")) return;
    
    setLoading(true);
    try {
      await deleteUserRole(selectedRoleId);
      await loadData();
      showSnackbar("Role deleted successfully!", "success");
    } catch (error) {
      showSnackbar("Failed to delete role", "error");
    } finally {
      setLoading(false);
    }
  };

  // Update the renderPermissionSection to handle undefined permissions safely
  const renderPermissionSection = (title: string, keys: PermissionKey[]) => (
    <Grid item xs={12} md={4}>
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>{title}</Typography>
      <FormGroup>
        {keys.map(key => (
          <FormControlLabel
            key={key}
            control={
              <Checkbox 
                checked={permissions ? permissions[key] || false : false}
                onChange={handlePermissionChange(key)}
                disabled={loading}
              />
            }
            label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())}
          />
        ))}
      </FormGroup>
    </Grid>
  );

  // Add error display to the UI
  return (
    <Box sx={{ display: "flex", width: "100vw", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AppBar position="static" sx={{
          bgcolor: theme.palette.background.paper,
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary
        }}>
          <Navbar title="User Access Management" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </AppBar>

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                <Typography>User Role:</Typography>
                <Select 
                  value={selectedRole} 
                  onChange={handleRoleChange} 
                  sx={{ minWidth: 200 }}
                  disabled={loading || userTypes.length === 0}
                >
                  {roles.map(role => (
                    <MenuItem key={role.id} value={role.userType}>{role.userType}</MenuItem>
                  ))}
                </Select>

                <Box sx={{ display: "flex", gap: 2, ml: "auto" }}>
                  <Button 
                    variant="contained" 
                    onClick={handleUpdate} 
                    disabled={loading || !selectedRoleId}
                  >
                    {loading ? <CircularProgress size={20} /> : "Update"}
                  </Button>
                  <Button variant="contained" color="secondary" onClick={handleNew} disabled={loading}>
                    New
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error" 
                    onClick={handleDelete} 
                    disabled={loading || !selectedRoleId}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Role Description"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                sx={{ mt: 3 }}
                disabled={loading}
              />
            </Paper>

            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3 }}>Role Permissions</Typography>
              <Grid container spacing={3}>
                {renderPermissionSection("Admin Panel Access", [
                  "adminDashboard", "userManagement", "roleManagement", "systemSettings",
                  "auditLogs", "backupRestore", "apiManagement", "reportGeneration", "dataExport", "systemMonitoring"
                ])}
                {renderPermissionSection("Home Dashboard Access", [
                  "managerDashboard", "workOrderManagement", "teamManagement", "performanceReports",
                  "inventoryView", "maintenanceScheduling", "costAnalysis", "kpiMonitoring", "documentManagement", "approvalWorkflows"
                ])}
                {renderPermissionSection("Other Settings", [
                  "partsCatalog", "orderManagement", "deliveryTracking", "invoiceSubmission",
                  "inventoryManagement", "contractView", "serviceRequests", "complianceDocuments", "performanceMetrics"
                ])}
              </Grid>
            </Paper>
          </Box>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>

        <Dialog 
          open={newRoleDialog} 
          onClose={() => setNewRoleDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Role</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Role Name"
                value={newRoleForm.name}
                onChange={(e) => setNewRoleForm((prev: any) => ({ ...prev, name: e.target.value }))}
                disabled={loading}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setNewRoleDialog(false)} 
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateRole} 
              variant="contained" 
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : "Create"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default UserAccessManagementSystem;