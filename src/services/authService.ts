import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Session timeout variables
let inactivityTimer: NodeJS.Timeout;
const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

// Function to reset the inactivity timer
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    // Logout user when timer expires
    logout();
    // Redirect to login page
    window.location.href = '/login';
  }, SESSION_TIMEOUT);
}

// Function to setup activity listeners
function setupActivityListeners() {
  // Listen for user activity events
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  
  events.forEach(event => {
    window.addEventListener(event, resetInactivityTimer);
  });
  
  // Initialize the timer
  resetInactivityTimer();
}

// Login function
export async function login({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  const res = await api.post("/api/login", {
    username,
    password,
  });

  if (res.data.token) {
    localStorage.setItem('token', res.data.token);
    if (res.data.user) {
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    // Start tracking activity after successful login
    setupActivityListeners();
  }

  return res.data;
}

// Logout function
export async function logout() {
  const token = localStorage.getItem('token');
  
  // Clear the inactivity timer
  clearTimeout(inactivityTimer);

  if (!token) return;

  try {
    await api.post('/api/logout', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

// Validate user session
export async function validateUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await api.get('/api/user', {  
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Reset activity timer on validation
      resetInactivityTimer();
      return response.data.user;
    }
    return null;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    console.error("User validation failed:", error);
    return null;
  }
}

// Add request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    // Reset activity timer on successful API responses
    resetInactivityTimer();
    return response;
  },
  async (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        clearTimeout(inactivityTimer);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}