import axios from "axios";

export type PermissionKey = 
  | "adminDashboard" | "userManagement" | "roleManagement" | "systemSettings" | "auditLogs" | "backupRestore" | "apiManagement" | "reportGeneration" | "dataExport" | "systemMonitoring"
  | "managerDashboard" | "workOrderManagement" | "teamManagement" | "performanceReports" | "inventoryView" | "maintenanceScheduling" | "costAnalysis" | "kpiMonitoring" | "documentManagement" | "approvalWorkflows"
  | "partsCatalog" | "orderManagement" | "deliveryTracking" | "invoiceSubmission" | "inventoryManagement" | "contractView" | "serviceRequests" | "complianceDocuments" | "performanceMetrics";

interface PermissionObject {
  [key: string]: boolean;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  userType: string; 
  permissionObject: Record<PermissionKey, boolean>;
}

export interface UserType {
  id: number;
  userType: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Fetch only user types for dropdown
export const fetchUserTypes = async (): Promise<UserType[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/user-roles`, getAuthHeader());
    return response.data.map((role: any) => ({
      id: role.id,
      userType: role.userType
    }));
  } catch (error) {
    console.error('Error fetching user types:', error);
    throw new Error(
      axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to fetch user types'
    );
  }
};

// Fetch full role details when needed
export const fetchUserRoles = async (): Promise<UserRole[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/user-roles`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching user roles:', error);
    throw new Error(
      axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to fetch user roles'
    );
  }
};

// Create new role
export const createUserRole = async (roleData: {
  name: string;
  userType: string;
  description: string;
  permissionObject: Record<PermissionKey, boolean>;
}): Promise<UserRole> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/user-role-create`,
      roleData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error creating user role:', error);
    throw new Error(
      axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to create user role'
    );
  }
};

// Update role
export const updateUserRole = async (id: string, roleData: Partial<UserRole>): Promise<UserRole> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/user-role/${id}/update`,
      roleData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error(
      axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to update user role'
    );
  }
};

// Delete role
export const deleteUserRole = async (id: string): Promise<void> => {
  try {
    await axios.delete(
      `${API_BASE_URL}/api/user-role/${id}/delete`,
      getAuthHeader()
    );
  } catch (error) {
    console.error('Error deleting user role:', error);
    throw new Error(
      axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to delete user role'
    );
  }
};

// Create user access permissions
export const createUserAccess = async (accessData: {
  userType: string;
  description: string;
  permissionObject: PermissionObject;
}): Promise<void> => {
  try {
    await axios.post(
      `${API_BASE_URL}/api/user-access-create`,
      accessData,
      getAuthHeader()
    );
  } catch (error) {
    console.error('Error creating user access:', error);
    throw new Error(
      axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to create user access'
    );
  }
};