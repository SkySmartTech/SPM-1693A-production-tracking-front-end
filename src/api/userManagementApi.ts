import axios from "axios";
import { User } from "../types/userManagementTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchUsers = async (): Promise<User[]> => {
  const response = await axios.get(`${API_BASE_URL}/api/all-users`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  return response.data.data || response.data;
};

export const createUser = async (userData: User): Promise<User> => {
  const response = await axios.post(`${API_BASE_URL}/api/user-register`, userData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  return response.data;
};

export const updateUser = async (id: number, userData: User): Promise<User> => {
  const response = await axios.post(`${API_BASE_URL}/api/user/${id}`, userData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  return response.data;
};

export const deactivateUser = async (id: number): Promise<void> => {
  await axios.patch(`${API_BASE_URL}/api/all-users/${id}/deactivate`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }
  });
};