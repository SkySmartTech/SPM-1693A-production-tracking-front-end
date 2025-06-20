import axios from "axios";

interface User {
  name: string;
  username: string;
  password: string;
  email: string;
  id: string;
  department: string;
  contact: string;
  photo: string;
}

interface UserProfileUpdateData {
  name?: string;
  username?: string;
  email?: string;
  department?: string;
  contact?: string;
}

export const fetchUserProfile = async (): Promise<User> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/user`, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }
    );

    if (!response.data) {
      throw new Error('No data received from server');
    }

    const data = response.data;

    return {
      name: data.employeeName || data.name || "",
      username: data.username || "",
      password: "********", // Masked for security
      email: data.email || "",
      id: data.epf || data.id || "",
      department: data.department || "",
      contact: data.contact || "",
      photo: data.photo || ""
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error(
      axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to fetch user profile'
    );
  }
};

export const updateUserProfile = async (userData: UserProfileUpdateData & { id: string }): Promise<void> => {
  try {
    // No need to get or check token
    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/user/${userData.id}/profile-update`, 
      userData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error(
      axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to update user profile'
    );
  }
};

export const uploadUserPhoto = async (userId: string, file: File): Promise<string> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('photo', file);

    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/user/${userId}/photo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data.photoUrl || response.data.photo;
  } catch (error) {
    console.error('Error uploading user photo:', error);
    throw new Error(
      axios.isAxiosError(error) 
        ? error.response?.data?.message || error.message 
        : 'Failed to upload photo'
    );
  }
};