// src/api/productionApi.ts
import axios from "axios";

interface DropdownOptions {
  teams: string[];
  styles: string[];
  colors: string[];
  sizes: string[];
  checkPoints: string[];
}

interface ProductionData {
  buyer: string;
  gg: string;
  smv: string;
  presentCarder: string;
  reworkCount: number;
  successCount: number;
  defectCount: number;
  hourlyData: number[];
}

interface DefectReworkData {
  parts: string[];
  locations: string[];
  defectCodes: string[];
}

interface Filters {
  teamNo: string;
  style: string;
  color: string;
  size: string;
  checkPoint: string;
}

interface FormData {
  part: string;
  location: string;
  defectCode: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const fetchDropdownOptions = async (): Promise<DropdownOptions> => {
  try {
    // Fetch all dropdown options in parallel
    const [teams, styles, colors, sizes, checkPoints] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/team-no`, getAuthHeader()),
      axios.get(`${API_BASE_URL}/api/all-styles`, getAuthHeader()),
      axios.get(`${API_BASE_URL}/api/color`, getAuthHeader()),
      axios.get(`${API_BASE_URL}/api/size`, getAuthHeader()),
      axios.get(`${API_BASE_URL}/api/checkpoint`, getAuthHeader())
    ]);

    return {
      teams: teams.data || [],
      styles: styles.data || [],
      colors: colors.data || [],
      sizes: sizes.data || [],
      checkPoints: checkPoints.data || []
    };
  } catch (error) {
    console.error('Error fetching dropdown options:', error);
    throw error;
  }
};

export const fetchDefectReworkOptions = async (): Promise<DefectReworkData> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/defect-rework-options`, getAuthHeader());
    return {
      parts: response.data.parts || [],
      locations: response.data.locations || [],
      defectCodes: response.data.defectCodes || []
    };
  } catch (error) {
    console.error('Error fetching defect/rework options:', error);
    throw error;
  }
};

export const fetchProductionData = async (filters: Filters): Promise<ProductionData> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/production-data`, {
      params: filters,
      ...getAuthHeader()
    });
    return response.data || {
      buyer: 'N/A',
      gg: '0',
      smv: '0',
      presentCarder: '0',
      reworkCount: 0,
      successCount: 0,
      defectCount: 0,
      hourlyData: [0, 0, 0, 0, 0, 0, 0, 0]
    };
  } catch (error) {
    console.error('Error fetching production data:', error);
    throw error;
  }
};

export const submitDefectRework = async (
  type: 'rework' | 'defect',
  formData: FormData,
  filters: Filters
): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/api/${type}-submit`, {
      ...formData,
      ...filters
    }, getAuthHeader());
  } catch (error) {
    console.error(`Error submitting ${type}:`, error);
    throw error;
  }
};