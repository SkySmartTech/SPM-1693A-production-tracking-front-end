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

    return {
      name: response.data.employeeName || "",
      username: response.data.username || "",
      password: "********",
      email: response.data.email || "",
      id: response.data.epf || "",
      department: response.data.department || "",
      contact: response.data.contact || "",
      photo: response.data.photo || ""
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (user: Partial<User>): Promise<void> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  await axios.put(
    `${import.meta.env.VITE_API_BASE_URL}/api/user`, 
    user,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
};

export const uploadUserPhoto = async (formData: FormData): Promise<void> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/api/user/photo`, 
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    }
  );
};