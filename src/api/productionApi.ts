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
  const res = await axios.get("/api/all-day-plans");
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

export async function fetchBuyerDetails(lineNo: string) {
  const res = await axios.post("/api/get-buyer", { lineNo });
  return res.data;
}

export async function fetchDefectReworkOptions() {
  const res = await axios.get("/api/all-defects");
  return {
    parts: [], 
    locations: [], 
    defectCodes: res.data.map((item: any) => item.defectCode),
  };
}