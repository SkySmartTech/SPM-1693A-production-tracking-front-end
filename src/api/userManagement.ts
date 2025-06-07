import axios from "axios";

export interface User {
  id?: number;
  epf: string;
  employeeName: string;
  username: string;
  department: string;
  contact: string;
  email: string;
  userType: string;
  availability: boolean;
  password: string;
  status: string;
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to inject token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get("/api/all-users");
    
    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const createUser = async (userData: User): Promise<User> => {
  try {
    const response = await api.post("/api/all-users", userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id: number, userData: User): Promise<User> => {
  try {
    const response = await api.put(`/api/all-users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    await api.delete(`/api/all-users/${id}`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const userManagementService = {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
};