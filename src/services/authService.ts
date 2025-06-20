import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

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
  }

  return res.data;
}

// Validate user session
export async function validateUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await api.get('/api/user', {  // Updated path to include /api/
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
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

// Logout function
export async function logout() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    await api.post('/api/logout', {}, {  // Updated path to include /api/
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
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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