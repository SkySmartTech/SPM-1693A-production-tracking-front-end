import { useState, useEffect, useCallback } from "react";
import {
  AppBar,
  Typography,
  Box,
  Stack,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  CssBaseline,
  useTheme,
  Alert,
} from "@mui/material";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import { dashboardInfo } from "../../data/dashboardInfo";
import { DashboardData, dashboardData as mockData } from "../../data/dashboardData";
import { useCustomTheme } from "../../context/ThemeContext";
import Navbar from "../../components/Navbar";
import { checkUserPermission } from "../../api/userAccessmanagementApi";

const Dashboard = () => {
  const [] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData[]>([]);
  const [hourlyData, setHourlyData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [, setRefreshCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  useCustomTheme();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await axios.get("http://your-backend-api.com/dashboard-data", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setDashboardData(response.data);
      setHourlyData(response.data.hourly || []);

      // For demo purposes, still use mock data
      setDashboardData(mockData);
      setHourlyData([56, 45, 60, 55, 48, 52, 49, 51]);
      setError(null);
      setRefreshCount(prev => prev + 1);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardData(mockData);
      setHourlyData([0, 0, 0, 0, 0, 0, 0, 0]);
      setError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial data fetch
    fetchData();

    // Check auto refresh permission
    const checkPermissions = async () => {
      try {
        const hasPermission = await checkUserPermission("autoRefresh");
        setAutoRefreshEnabled(hasPermission);
      } catch (error) {
        console.error("Error checking permissions:", error);
        setAutoRefreshEnabled(false);
      }
    };

    checkPermissions();

    return () => {
    };
  }, [fetchData]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (autoRefreshEnabled) {
      intervalId = setInterval(() => {
        fetchData();
      }, 120000); // 2 minutes in milliseconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefreshEnabled, fetchData]);

  return (
    <Box sx={{ display: "flex", width: "100%", height: "100vh", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar
        open={sidebarOpen || hovered}
        setOpen={setSidebarOpen}
      />
      <Box component="main" sx={{ flexGrow: 1 }}>
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
            title="Dashboard"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </AppBar>

        <Box sx={{ p: 2 }}>
          {autoRefreshEnabled && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Auto-refresh enabled (every 2 minutes). Last refreshed: {new Date().toLocaleTimeString()}
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={2} sx={{ my: 1 }}>
            <Card sx={{ p: 0, textAlign: "center", borderRadius: "8px", boxShadow: 1 }}>
              <CardContent>
                <Stack
                  direction="row"
                  spacing={10}
                  justifyContent="center"
                  sx={{
                    flexWrap: "nowrap",
                    overflowX: "auto",
                    py: 1
                  }}
                >
                  {dashboardInfo.map((info, index) => (
                    <Typography key={index} variant="body1" fontWeight="bold">
                      {info}
                    </Typography>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>

          {loading ? (
            <Stack justifyContent="center" alignItems="center" sx={{ mt: 5 }}>
              <CircularProgress color="primary" />
            </Stack>
          ) : (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows: 'repeat(4, 1fr)',
              gap: 2,
              p: 3,
              height: '600px'
            }}>
              {dashboardData.map((item, index) => {
                const gridStyles: Record<number, { gridColumn: string; gridRow: string }> = {
                  0: { gridColumn: '1', gridRow: '1 / span 2' },
                  1: { gridColumn: '2', gridRow: '1 / span 2' },
                  2: { gridColumn: '3', gridRow: '1' },
                  3: { gridColumn: '4', gridRow: '1' },
                  4: { gridColumn: '3', gridRow: '2' },
                  5: { gridColumn: '4', gridRow: '2' },
                  6: { gridColumn: '1', gridRow: '3' },
                  7: { gridColumn: '2', gridRow: '3' },
                  8: { gridColumn: '1', gridRow: '4' },
                  9: { gridColumn: '2', gridRow: '4' },
                  10: { gridColumn: '3', gridRow: '3 / span 2' },
                  11: { gridColumn: '4', gridRow: '3 / span 2' }
                };

                const currentStyles = gridStyles[index];
                const isLargeBox = [0, 1, 10, 11].includes(index);

                return (
                  <Box
                    key={item.id}
                    sx={{
                      ...currentStyles,
                      minHeight: 0
                    }}
                  >
                    <Card
                      sx={{
                        borderRadius: "16px",
                        boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.08)",
                        overflow: "hidden",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: "#0780FF",
                          color: "white",
                          p: isLargeBox ? 3 : 2,
                          textAlign: "center",
                          flex: isLargeBox ? 3 : 1,
                          display: "flex",
                          borderBottomLeftRadius: "12px",
                          borderBottomRightRadius: "12px",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          variant={isLargeBox ? "h3" : "h4"}
                          fontWeight={800}
                          sx={{ fontSize: isLargeBox ? '2.5rem' : '1.5rem' }}
                        >
                          {item.value}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          bgcolor: theme.palette.background.paper,
                          color: theme.palette.text.primary,
                          p: 1,
                          textAlign: "center",
                          flex: isLargeBox ? 0.5 : 0.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          sx={{ fontSize: isLargeBox ? '1rem' : '0.875rem' }}
                        >
                          {item.title}
                        </Typography>
                      </Box>
                    </Card>
                  </Box>
                );
              })}
            </Box>
          )}

          <Stack
            direction="row"
            flexWrap="initial"
            spacing={2}
            useFlexGap
            sx={{ width: '100%', mt: 3 }}
          >
            {hourlyData.map((value, index) => (
              <Box
                key={index}
                sx={{
                  width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(16.66% - 16px)' },
                }}
              >
                <Card
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    borderRadius: '8px',
                    boxShadow: 3,
                    bgcolor: index < 4 ? '#00BA57' : index >= hourlyData.length - 4 ? '#78B3CE' : 'background.paper',
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'translateY(-5px)' }
                  }}
                >
                  <Typography variant="subtitle2" color="textSecondary">
                    HOUR: {index + 1}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="h5">{value}</Typography>
                </Card>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;