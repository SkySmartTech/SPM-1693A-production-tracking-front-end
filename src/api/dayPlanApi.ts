import axios from "axios";

export interface DayPlan {
  id: number;
  lineNo: string;
  respEmployee: string;
  buyer: string;
  style: string;
  gg: string;
  smv: string;
  displayWH: string;
  actualWH: string;
  planTgtPcs: string;
  perHourPcs: string;
  availableCader: string;
  presentLinkers: string;
  checkPoint: string;
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
      lineNo: plan.lineNo || "",
      respEmployee: plan.respEmployee || "",
      buyer: plan.buyer || "",
      style: plan.style || "",
      gg: plan.gg || "",
      smv: plan.smv || "",
      displayWH: plan.displayWH || "",
      actualWH: plan.actualWH || "",
      planTgtPcs: plan.planTgtPcs || "",
      perHourPcs: plan.perHourPcs || "",
      availableCader: plan.availableCader || "",
      presentLinkers: plan.presentLinkers || "",
      checkPoint: plan.checkPoint || "",
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