import { useState, useEffect } from 'react';
import {
  AppBar,
  Typography,
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
  Person,
  Style as StyleIcon,
  AssignmentTurnedIn
} from '@mui/icons-material';
import { Delete } from '@mui/icons-material';
import { useCustomTheme } from "../../context/ThemeContext";
import Sidebar from "../../components/Sidebar";
import { MenuItem } from "@mui/material";
import {
  Production,
  fetchColorData,
  fetchStyleData,
  fetchSizeData,
  fetchCheckPointData,
  fetchTeamData,
  fetchBuyerDetails,
  fetchPartLocationOptions,
  fetchDefectReworkOptions,
  saveProductionUpdate,
  saveHourlyCount,
} from '../../api/productionApi';
import { Controller, useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../../components/Navbar';
import axios from 'axios';

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


interface StyleOption {
  style: any;
  sizeName: any;
  lineNo: any;
  actual_column_name: any;
  checkPointName: any;
  styleDescription: any;
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
  const [dropdownOptions, setDropdownOptions] = useState({
    styles: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
    checkPoints: [] as string[]
  });
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const theme = useTheme();
  useCustomTheme();

  const fetchProductionData = async (teamNo: string) => {
    try {
      const res = await axios.post(`/api/get-production-data?lineNo=${teamNo}`);
      const responseData = res.data;
      const productionData = responseData.dayPlan?.[0] || {};

      return {
        buyer: productionData.buyer || "N/A",
        gg: productionData.gg?.toString() || "0",
        smv: productionData.smv?.toString() || "0",
        presentCarder: productionData.presentCarder?.toString() || "0",
        successCount: responseData.successCount || 0,
        reworkCount: responseData.reworkCount || 0,
        defectCount: responseData.defectCount || 0,
        hourlyData: responseData.hourlySuccess ? [
          responseData.hourlySuccess['1'] || 0,
          responseData.hourlySuccess['2'] || 0,
          responseData.hourlySuccess['3'] || 0,
          responseData.hourlySuccess['4'] || 0,
          responseData.hourlySuccess['5'] || 0,
          responseData.hourlySuccess['6'] || 0,
          responseData.hourlySuccess['7'] || 0,
          responseData.hourlySuccess['8'] || 0
        ] : [0, 0, 0, 0, 0, 0, 0, 0]
      };
    } catch (error) {
      console.error('Error fetching production data:', error);
      throw error;
    }
  };

  const loadDropdownOptions = async (teamNo: string) => {
    try {
      setLoading(prev => ({ ...prev, options: true }));
      
      const [colors, styles, sizes, checkPoints] = await Promise.all([
        fetchColorData(teamNo),
        fetchStyleData(teamNo),
        fetchSizeData(teamNo),
        fetchCheckPointData(teamNo)
      ]);

      setDropdownOptions({
        styles: styles.map((item: any) => item.style) || [],
        colors: colors.map((item: any) => item.color) || [],
        sizes: sizes.map((item: any) => item.sizeName) || [],
        checkPoints: checkPoints.map((item: any) => item.actual_column_name) || []
      });

    } catch (error) {
      console.error('Error loading dropdown options:', error);
      showSnackbar('Failed to load dropdown options', 'error');
    } finally {
      setLoading(prev => ({ ...prev, options: false }));
    }
  };

  const handleTeamNoChange = async (newValue: string | null, field: any) => {
    field.onChange(newValue);
    if (newValue) {
      try {
        setLoading(prev => ({ ...prev, data: true }));
        
        // Clear all dropdowns first
        setFilters({
          teamNo: newValue,
          style: '',
          color: '',
          size: '',
          checkPoint: ''
        });
        setValue("style", "");
        setValue("color", "");
        setValue("size", "");
        setValue("checkPoint", "");

        // Load dropdown options for this team
        await loadDropdownOptions(newValue);

        // Fetch production data for the selected team
        const productionStats = await fetchProductionData(newValue);
        setData(productionStats);

        // Fetch defect/rework options
        const [defectOptions, partLocationOptions] = await Promise.all([
          fetchDefectReworkOptions(newValue),
          fetchPartLocationOptions(newValue)
        ]);

        setDefectReworkOptions({
          parts: Array.from(new Set(partLocationOptions.partLocations.map((item: any) => item.part))) as string[],
          locations: Array.from(new Set(partLocationOptions.partLocations.map((item: any) => item.location))) as string[],
          defectCodes: defectOptions.defectCodes
        });

        // Get default values for this team
        const details = await fetchBuyerDetails(newValue);
        const productionData = details.latestProductionData?.[0] || {};
        
        const newFilters = {
          teamNo: newValue,
          style: productionData.style || "",
          color: productionData.color || "",
          size: productionData.sizeName || "",
          checkPoint: productionData.checkPoint || ""
        };
        
        setFilters(newFilters);
        
        // Set form values if data exists
        if (productionData.style) setValue("style", productionData.style);
        if (productionData.color) setValue("color", productionData.color);
        if (productionData.sizeName) setValue("size", productionData.sizeName);
        if (productionData.checkPoint) setValue("checkPoint", productionData.checkPoint);

      } catch (error) {
        console.error('Error loading team details:', error);
        showSnackbar('Failed to load team details', 'error');
      } finally {
        setLoading(prev => ({ ...prev, data: false }));
      }
    } else {
      // Clear everything if teamNo is cleared
      setFilters({
        teamNo: '',
        style: '',
        color: '',
        size: '',
        checkPoint: ''
      });
      setData(defaultProductionData);
      setDropdownOptions({
        styles: [],
        colors: [],
        sizes: [],
        checkPoints: []
      });
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(prev => ({ ...prev, options: true }));
        const teams = await fetchTeamData();
        
        // Reset all data first
        setFilters({
          teamNo: '',
          style: '',
          color: '',
          size: '',
          checkPoint: ''
        });
        setData(defaultProductionData);
        setDropdownOptions({
          styles: [],
          colors: [],
          sizes: [],
          checkPoints: []
        });

        // Only set first team if teams exist, but don't load data yet
        if (teams.length > 0) {
          setFilters(prev => ({
            ...prev,
            teamNo: teams[0].lineNo || ''
          }));
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        showSnackbar('Failed to load initial data', 'error');
      } finally {
        setLoading(prev => ({ ...prev, options: false }));
        setInitialLoadComplete(true);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (initialLoadComplete && filters.teamNo) {
      const loadTeamData = async () => {
        try {
          setLoading(prev => ({ ...prev, data: true }));
          await handleTeamNoChange(filters.teamNo, { onChange: () => {} });
        } catch (error) {
          console.error('Error loading team data:', error);
          showSnackbar('Failed to load team data', 'error');
        } finally {
          setLoading(prev => ({ ...prev, data: false }));
        }
      };
      
      loadTeamData();
    }
  }, [initialLoadComplete, filters.teamNo]);

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

  const handleSuccessClick = async () => {
    if (!filters.teamNo) {
      showSnackbar("Please select a team first", "error");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, submit: true }));
      await saveProductionUpdate({
        filters,
        data,
        qualityState: "Success"
      });
      await saveHourlyCount({ filters, qualityState: "Success" });
      
      // Refresh the counts after submission
      const updatedData = await fetchProductionData(filters.teamNo);
      setData(updatedData);
      
      showSnackbar("Success submitted", "success");
    } catch (error) {
      showSnackbar("Failed to submit success", "error");
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleSubmit = async (type: 'rework' | 'defect') => {
    if (!filters.teamNo) {
      showSnackbar("Please select a team first", "error");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, submit: true }));
      await saveProductionUpdate({
        filters,
        data,
        qualityState: type === "rework" ? "Rework" : "Defect",
        part: formData.part,
        location: formData.location,
        defectCode: formData.defectCode
      });
      await saveHourlyCount({
        filters,
        qualityState: type === "rework" ? "Rework" : "Defect"
      });
      
      // Refresh the counts after submission
      const updatedData = await fetchProductionData(filters.teamNo);
      setData(updatedData);
      
      showSnackbar(`${type.charAt(0).toUpperCase() + type.slice(1)} submitted successfully`, 'success');
      handleDialogClose(type);
    } catch (error) {
      showSnackbar(`Failed to submit ${type}`, "error");
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const {
    control,
    formState: { errors },
    setValue
  } = useForm<Production>({
    reValidateMode: "onChange",
    mode: "onChange",
  });

  const { data: teamData } = useQuery<StyleOption[]>({
    queryKey: ["teams"],
    queryFn: fetchTeamData,
  });

  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh", minHeight: "100vh" }}>
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
            title="Production Update"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </AppBar>
        <Box sx={{ p: 3, flexGrow: 1, overflow: "auto" }}>
          {loading.options ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ ml: 2 }}>Loading initial data...</Typography>
            </Box>
          ) : (
            <Card sx={{ p: 3, borderRadius: '12px', boxShadow: 3 }}>
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

              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Controller
                  control={control}
                  name="teamNo"
                  render={({ field }) => (
                    <Autocomplete
                      value={field.value || ''}
                      onChange={async (_event, newValue) => {
                        await handleTeamNoChange(newValue, field);
                      }}
                      size="small"
                      options={teamData?.map(team => team.lineNo) || []}
                      getOptionLabel={(option) => option}
                      sx={{ flex: 1, margin: "0.5rem" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.teamNo}
                          helperText={errors.teamNo && "Required"}
                          label="Team No"
                        />
                      )}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="style"
                  render={({ field }) => (
                    <Autocomplete
                      value={field.value || ''}
                      onChange={(_event, newValue) => {
                        field.onChange(newValue);
                        setFilters(prev => ({
                          ...prev,
                          style: newValue || "",
                        }));
                      }}
                      size="small"
                      options={dropdownOptions.styles}
                      getOptionLabel={(option) => option}
                      sx={{ flex: 1, margin: "0.5rem" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.style}
                          helperText={errors.style && "Required"}
                          label="Style"
                        />
                      )}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="color"
                  render={({ field }) => (
                    <Autocomplete
                      value={field.value || ''}
                      onChange={(_event, newValue) => {
                        field.onChange(newValue);
                        setFilters(prev => ({
                          ...prev,
                          color: newValue || "",
                        }));
                      }}
                      size="small"
                      options={dropdownOptions.colors}
                      getOptionLabel={(option) => option}
                      sx={{ flex: 1, margin: "0.5rem" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.color}
                          helperText={errors.color && "Required"}
                          label="Color"
                        />
                      )}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="size"
                  render={({ field }) => (
                    <Autocomplete
                      value={field.value || ''}
                      onChange={(_event, newValue) => {
                        field.onChange(newValue);
                        setFilters(prev => ({
                          ...prev,
                          size: newValue || "",
                        }));
                      }}
                      size="small"
                      options={dropdownOptions.sizes}
                      getOptionLabel={(option) => option}
                      sx={{ flex: 1, margin: "0.5rem" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.size}
                          helperText={errors.size && "Required"}
                          label="Size"
                        />
                      )}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="checkPoint"
                  render={({ field }) => (
                    <Autocomplete
                      value={field.value || ''}
                      onChange={(_event, newValue) => {
                        field.onChange(newValue);
                        setFilters(prev => ({
                          ...prev,
                          checkPoint: newValue || "",
                        }));
                      }}
                      size="small"
                      options={dropdownOptions.checkPoints}
                      getOptionLabel={(option) => option}
                      sx={{ flex: 1, margin: "0.5rem" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.checkPoint}
                          helperText={errors.checkPoint && "Required"}
                          label="Check Point"
                        />
                      )}
                    />
                  )}
                />
              </Stack>

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
                      onClick: handleSuccessClick
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
                            cursor: typeof status.onClick === 'function' ? 'pointer' : 'default'
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

              <Stack
                direction="row"
                flexWrap="initial"
                spacing={2}
                useFlexGap
                sx={{ width: '100%', mt: 3 }}
              >
                {Array.isArray(data.hourlyData) && data.hourlyData.map((value, index) => (
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
                  <MenuItem key={`${part}-${index}`} value={part}>{part}</MenuItem>
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
                  <MenuItem key={`${location}-${index}`} value={location}>{location}</MenuItem>
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
                  <MenuItem key={`${code}-${index}`} value={code}>{code}</MenuItem>
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
                  <MenuItem key={`${part}-${index}`} value={part}>{part}</MenuItem>
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
                  <MenuItem key={`${location}-${index}`} value={location}>{location}</MenuItem>
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
                  <MenuItem key={`${code}-${index}`} value={code}>{code}</MenuItem>
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