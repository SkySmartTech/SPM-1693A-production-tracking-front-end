// src/api/userManagementApi.ts
import axios from "axios";
import { User } from "./userApi";

// Create Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  
});

// Automatically attach token to every request (if stored)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



export const fetchUsers = async (): Promise<User[]> => {
  const response = await API.get("/api/all-users");
  return response.data.data;
};

export const createUser = async (userData: User): Promise<User> => {
  const response = await API.post("/api/all-users", userData);
  return response.data;
};

export const updateUser = async (id: number, userData: User): Promise<User> => {
  const response = await API.put(`/api/all-users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await API.delete(`/api/all-users/${id}`);
};
