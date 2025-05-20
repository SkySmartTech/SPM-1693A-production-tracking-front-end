import axios from "axios";

export async function fetchDayPlans() {
  const res = await axios.get(`/api/day-plans`);
  return res.data;
}