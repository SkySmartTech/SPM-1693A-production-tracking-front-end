import axios from "axios";

export type PermissionKey =
  | "homeDashboard" | "userManagement" | "roleManagement" | "systemSettings" | "auditLogs" | "backupRestore" | "apiManagement" | "reportGeneration" | "dataExport" | "systemMonitoring"
  | "managerDashboard" | "workOrderManagement" | "teamManagement" | "performanceReports" | "inventoryView" | "maintenanceScheduling" | "costAnalysis" | "kpiMonitoring" | "documentManagement" | "approvalWorkflows"
  | "partsCatalog" | "orderManagement" | "deliveryTracking" | "invoiceSubmission" | "inventoryManagement" | "contractView" | "serviceRequests" | "complianceDocuments" | "performanceMetrics";

export interface UserRole {
  userType: string | number | readonly string[] | undefined;
  id: string;
  name: string;
  description: string;
  permissionObject: Record<PermissionKey, boolean>;
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

// Fetch all roles
export const fetchUserRoles = async (): Promise<UserRole[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/user-roles`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch user roles');
  }
};

// Create new role
export const createUserRole = async (roleData: {
  userType: string;
  description: string;
  permissionObject: Record<PermissionKey, boolean>;
}): Promise<UserRole> => {
  try {
    // Add userType as required by backend
    const payload = {
      ...roleData,
      userType: roleData.userType
    };
    const response = await axios.post(
      `${API_BASE_URL}/api/user-role-create`,
      payload,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to create user role');
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
    throw new Error('Failed to update user role');
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
    throw new Error('Failed to delete user role');
  }
};