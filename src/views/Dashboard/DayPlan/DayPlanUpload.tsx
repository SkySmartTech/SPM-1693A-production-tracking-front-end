import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  AppBar,
  CssBaseline,
  useTheme,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Sidebar from "../../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCustomTheme } from "../../../context/ThemeContext";
import { fetchDayPlans, uploadDayPlanFile, DayPlan } from "../../../api/dayPlanApi";
import Navbar from "../../../components/Navbar";

const DayPlanUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hovered] = useState(false);
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
        lineNo: "1",
        respEmployee: "EMP001",
        buyer: "Buyer1",
        style: "Style1",
        gg: "GG1",
        smv: "2.5",
        displayWH: "8",
        actualWH: "8",
        planTgtPcs: "1000",
        perHourPcs: "125",
        availableCader: "50",
        presentLinkers: "45",
        checkPoint: "Check1",
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
    { field: "lineNo", headerName: "Line No", width: 50 },
    { field: "respEmployee", headerName: "Resp Employee", width: 100 },
    { field: "buyer", headerName: "Buyer", width: 80 },
    { field: "style", headerName: "Style", width: 80 },
    { field: "gg", headerName: "GG", width: 60 },
    { field: "smv", headerName: "SMV", width: 40 },
    { field: "displayWH", headerName: "Display WH", width: 40 },
    { field: "actualWH", headerName: "Actual WH", width: 50 },
    { field: "planTgtPcs", headerName: "Plan Tgt Pcs", width: 100 },
    { field: "perHourPcs", headerName: "Per Hour Pcs", width: 100 },
    { field: "availableCader", headerName: "Available Cader", width: 80 },
    { field: "presentLinkers", headerName: "Present Linkers", width: 80 },
    { field: "checkPoint", headerName: "Check Point", width: 90 },
    { field: "status", headerName: "Status", width: 90 },
    { field: "created_at", headerName: "Created At", width: 90 },
    { field: "updated_at", headerName: "Updated At", width: 90 },
  ];

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
        <AppBar
          position="static"
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 'none',
            borderBottom: `1px solid ${theme.palette.divider}`,
            zIndex: theme.zIndex.drawer + 1,
            color: theme.palette.text.primary
          }}
        >
          <Navbar
            title="Day Plan Upload"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </AppBar>

        <Box sx={{
          padding: 5,
          borderRadius: "8px",
          marginBottom: 5,
          bgcolor: theme.palette.background.paper,
          flexGrow: 1
        }}>

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