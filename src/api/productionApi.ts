import axios from "axios";
import { z } from "zod";
import dayjs from "dayjs";

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
  const res = await axios.post("/api/get-production-data", {lineNo });
  return res.data;
}

export async function fetchDefectReworkOptions() {
  const res = await axios.get("/api/all-defects");
  return {
    defectCodes: res.data.map((item: any) => item.defectCode),
  };
}

export async function fetchPartLocationOptions() {
  const res = await axios.get("/api/all-part-locations");
  return {
    partLocations: res.data.map((item: any) => ({
      part: item.part,
      location: item.location,
    })),
  };
}

// Save production update (Success, Rework, Defect)
export async function saveProductionUpdate({
  filters,
  data,
  qualityState,
  part = "",
  location = "",
  defectCode = ""
}: {
  filters: {
    teamNo: string;
    style: string;
    color: string;
    size: string;
    checkPoint: string;
  };
  data: {
    buyer: string;
    gg: string;
    smv: string;
    presentCarder: string;
  };
  qualityState: "Success" | "Rework" | "Defect";
  part?: string;
  location?: string;
  defectCode?: string;
}) {
  const body = {
    serverDateTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    lineNo: filters.teamNo,
    buyer: data.buyer,
    gg: data.gg,
    smv: Number(data.smv),
    presentCarder: Number(data.presentCarder),
    style: filters.style,
    color: filters.color,
    sizeName: filters.size,
    checkPoint: filters.checkPoint,
    qualityState,
    part,
    location,
    defectCode,
    state: 1
  };
  return axios.post("/api/production-update", body);
}

// Save hourly count
export async function saveHourlyCount({
  filters,
  qualityState
}: {
  filters: {
    teamNo: string;
    style: string;
    color: string;
    size: string;
    checkPoint: string;
  };
  qualityState: "Success" | "Rework" | "Defect";
}) {
  const body = {
    serverDateTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    lineNo: filters.teamNo,
    style: filters.style,
    color: filters.color,
    sizeName: filters.size,
    checkPoint: filters.checkPoint,
    qualityState
  };
  return axios.post("/api/production-update", body);
}

// Fetch total success count
export async function fetchSuccessCount(filters: {
  teamNo: string;
  style: string;
  color: string;
  size: string;
  checkPoint: string;
}) {
  const params = {
    lineNo: filters.teamNo,
    style: filters.style,
    color: filters.color,
    sizeName: filters.size,
    checkPoint: filters.checkPoint,
  };
  const res = await axios.post("/api/get-production-data", params);
  return res.data.count ?? 0;
}

export async function fetchReworkCount(filters: {
  teamNo: string;
  style: string;
  color: string;
  size: string;
  checkPoint: string;
}) {
  const params = {
    lineNo: filters.teamNo,
    style: filters.style,
    color: filters.color,
    sizeName: filters.size,
    checkPoint: filters.checkPoint,
  };
  const res = await axios.post("/api/get-production-data", params);
  return res.data.count ?? 0;
}

export async function fetchDefectCount(filters: {
  teamNo: string;
  style: string;
  color: string;
  size: string;
  checkPoint: string;
}) {
  const params = {
    lineNo: filters.teamNo,
    style: filters.style,
    color: filters.color,
    sizeName: filters.size,
    checkPoint: filters.checkPoint,
  };
  const res = await axios.post("/api/get-production-data", params);
  return res.data.count ?? 0;
}

// Fetch hourly success data
export async function fetchHourlySuccess(filters: {
  teamNo: string;
  style: string;
  color: string;
  size: string;
  checkPoint: string;
}) {
  const params = {
    lineNo: filters.teamNo,
    style: filters.style,
    color: filters.color,
    sizeName: filters.size,
    checkPoint: filters.checkPoint,
  };
  const res = await axios.post("/api/get-production-data", params);
  // Expecting res.data.hourlyData to be an array of 8 numbers
  return res.data.hourlyData ?? [0,0,0,0,0,0,0,0];
}