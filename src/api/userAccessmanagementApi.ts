import axios from "axios";

// Updated PermissionKey type to match the new structure from the image
export type PermissionKey = 
  // Admin Panel
  | "homeDashboard"
  
  // P2P Section
  | "p2pSection"
  | "productionDashboard"
  | "productionUpdate"
  | "dayPlanUpload"
  | "dayPlanReports"
  | "dayPlanSummary"
  
  // User Management
  | "userManagement"
  | "userAccount"
  | "userManagementSub"
  | "userAccessManagement"
  
  // System Management
  | "systemManagement"
  
  // User Profile
  | "userProfile"
  
  // Other Settings
  | "autoRefresh";

export interface UserRole {
  userType: string | number | readonly string[] | undefined;
  id: string;
  name: string;
  description: string;
  permissionObject: PermissionKey[]; // <-- change from Record<PermissionKey, boolean> to PermissionKey[]
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
  permissionObject: PermissionKey[]; // <-- change here
}): Promise<UserRole> => {
  try {
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
export const updateUserRole = async (id: string, roleData: Partial<Omit<UserRole, 'id'>>): Promise<UserRole> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/user-access/${id}/update`,
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