import axios from "axios";
import { z } from "zod";

export const productionSchema = z.object({
  id: z.string(),
  teamNo: z.string(),
  style: z.string(),
  color: z.string(),
  size: z.string(),
  checkPoint: z.string(),
});

export type Production = z.infer<typeof productionSchema>;


export async function fetchTeamData() {
  const res = await axios.get("/api/all-day-plans");
  return res.data;
}

export async function fetchColorData() {
  const res = await axios.get("/api/all-colors");
  return res.data;
}

export async function fetchStyleData() {
  const res = await axios.get("/api/all-styles");
  return res.data;
}

export async function fetchSizeData() {
  const res = await axios.get("/api/all-sizes");
  return res.data;
}

export async function fetchCheckPointData() {
  const res = await axios.get("/api/all-check-points"); 
  return res.data;
}




