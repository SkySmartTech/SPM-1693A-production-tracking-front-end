import { useState } from "react";
import {
  Box,
  Button,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Grid,
  Paper,
  CssBaseline,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Search,
  AccountCircle,
  RocketLaunch,
  Update,
  Settings,
  HelpOutline,
  Lock,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Fullscreen as FullscreenIcon,
  AccountCircle as AccountCircleIcon
} from "@mui/icons-material";
import Sidebar from "../../components/Sidebar";
import { Menu, MenuItem, Badge } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useCustomTheme } from "../../context/ThemeContext";

const HelpPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationCount] = useState(3);
  const theme = useTheme();
  useCustomTheme();

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

  // Help topics with navigation routes
  const helpTopics = [
    { icon: <RocketLaunch />, text: "Getting Started", route: "/getting-started" },
    { icon: <AccountCircle />, text: "My Account", route: "/UserProfile" },
    { icon: <Update />, text: "System Updates", route: "/system-updates" },
    { icon: <Settings />, text: "Settings & Preferences", route: "/settings" },
    { icon: <HelpOutline />, text: "FAQs & Troubleshooting", route: "/faqs" },
    { icon: <Lock />, text: "Security & Privacy", route: "/security" },
  ];

  // Simulated system-wide search results (sidebar + help topics)
  const allItems = [...helpTopics.map(topic => topic.text), "Dashboard", "Orders", "Reports", "Users", "Settings"];
  const filteredItems = searchTerm ? allItems.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase())) : [];

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
            bgcolor: theme.palette.background.paper,
            boxShadow: 'none',
            borderBottom: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.primary
          }}
        >
          <Toolbar>
            <IconButton 
              edge="start" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Help
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

        {/* Search Box */}
        <Box sx={{ 
          textAlign: "center", 
          height: "200px", 
          bgcolor: theme.palette.background.paper, 
          p: 4, 
          borderRadius: 5, 
          mb: 3, 
          mt: 4 
        }}>
          <Typography variant="h6" fontWeight="bold" mb={2} color="text.primary">
            How can we help you?
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <Button variant="outlined" onClick={() => console.log("Search clicked")}>
                  Search
                </Button>
              ),
              sx: { borderRadius: 50 }
            }}
            sx={{ maxWidth: 500, bgcolor: theme.palette.background.paper }}
          />
        </Box>

        {/* Search Results */}
        {searchTerm && filteredItems.length > 0 && (
          <Box sx={{ 
            bgcolor: theme.palette.background.paper, 
            p: 2, 
            borderRadius: 2, 
            mb: 2 
          }}>
            <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
              Search Results:
            </Typography>
            <List>
              {filteredItems.map((item, index) => (
                <ListItemButton 
                  key={index} 
                  onClick={() => console.log("Navigate to", item)}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                >
                  <ListItemText 
                    primary={item} 
                    primaryTypographyProps={{ color: 'text.primary' }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        )}

        {/* Help Topics - Now horizontal */}
        <Box sx={{ 
          bgcolor: theme.palette.background.paper, 
          p: 3, 
          borderRadius: 2 
        }}>
          <Typography variant="h6" fontWeight="bold" mb={2} color="text.primary">
            Help Topics
          </Typography>
          <Grid container spacing={2}>
            {helpTopics.map((topic, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    cursor: "pointer",
                    bgcolor: theme.palette.background.default,
                    "&:hover": { 
                      bgcolor: theme.palette.action.hover 
                    }
                  }}
                  onClick={() => navigate(topic.route)}
                >
                  <Box display="flex" alignItems="center">
                    <ListItemIcon sx={{ minWidth: 36, color: theme.palette.text.primary }}>
                      {topic.icon}
                    </ListItemIcon>
                    <Typography variant="body1" color="text.primary">
                      {topic.text}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default HelpPage;