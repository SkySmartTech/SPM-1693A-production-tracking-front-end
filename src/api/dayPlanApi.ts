// src/api/dayPlanApi.ts
import axios from "axios";

export interface DayPlan {
  id: number;
  line_no: string;
  resp_employee: string;
  buyer: string;
  style: string;
  gg: string;
  smv: string;
  display_wh: string;
  actual_wh: string;
  plan_tgt_pcs: string;
  per_hour_pcs: string;
  available_cader: string;
  present_linkers: string;
  check_point: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const fetchDayPlans = async (): Promise<DayPlan[]> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/all-day-plans`,
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

    return response.data.map((plan: any) => ({
      id: plan.id || 0,
      line_no: plan.line_no || "",
      resp_employee: plan.resp_employee || "",
      buyer: plan.buyer || "",
      style: plan.style || "",
      gg: plan.gg || "",
      smv: plan.smv || "",
      display_wh: plan.display_wh || "",
      actual_wh: plan.actual_wh || "",
      plan_tgt_pcs: plan.plan_tgt_pcs || "",
      per_hour_pcs: plan.per_hour_pcs || "",
      available_cader: plan.available_cader || "",
      present_linkers: plan.present_linkers || "",
      check_point: plan.check_point || "",
      status: plan.status || "",
      created_at: plan.created_at || "",
      updated_at: plan.updated_at || ""
    }));
  } catch (error) {
    console.error('Error fetching day plans:', error);
    throw error;
  }
};

export const uploadDayPlanFile = async (file: File): Promise<{ success: boolean; message: string }> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/day-plan-create`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.data) {
      throw new Error('No response data received');
    }

    return {
      success: response.data.success || false,
      message: response.data.message || 'File uploaded successfully'
    };
  } catch (error) {
    console.error('Error uploading day plan file:', error);
    throw error;
  }
};