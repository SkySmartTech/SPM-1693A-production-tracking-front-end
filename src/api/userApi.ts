import axios from "axios";
import { z } from "zod";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const userSchema = z.object({
  id: z.number().optional(),
  epf: z.string(),
  employeeName: z.string(),
  username: z.string(),
  department: z.string(),
  contact: z.string().optional(),
  email: z.string().email(),
  userType: z.string(),
  availability: z.boolean().optional(),
  status: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;


export async function registerUser(userData: Partial<User>) {
  const res = await API.post("/register", userData);  
  return res.data;
}

export async function validateUser() {
  const res = await API.get("/user");  
  return res.data;
}