import axios from 'axios';


// Login function
export async function login({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  const res = await axios.post("/api/login", {
    username,
    password,
  });
  return res.data;
}

// Validate user session
export async function validateUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await axios.get(`/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("User validation failed:", error);
    return null;
  }
}

// Logout function
export async function logout() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    await axios.post(`/logout`, {}, {
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