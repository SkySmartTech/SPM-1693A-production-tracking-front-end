import axios from "axios";

export interface DashboardDataResponse {
  lineNo: string;
  buyer: string;
  style: string;
  gg: string;
  smv: number;
  actualWH: string;
  availableCarder: number;
  today_target: number;
  today_target_achieved: number;
  today_balance: number;
  upto_now_target: number;
  upto_now_achieved: number;
  upto_now_balance: number;
  perHourTarget: number;
  hourlyTargetAchieve: number;
  hourlyBalance: number;
  totalCheckQty: number;
  total_defect_count: string;
  dhu: number;
  performance_efi: number;
  line_efi: number;
  top_defect_code: string | null;
}

export interface DashboardData {
  id: string;
  value: string | number;
  title: string;
  metrics: {
    label: string;
    value: string | number;
    highlight?: boolean;
  }[];
  timestamp?: string;
  status?: "active" | "inactive";
}

export const fetchAllLines = async (): Promise<DashboardDataResponse[]> => {
  try {
    const response = await axios.get("/api/get-all");
    return response.data;
  } catch (error) {
    console.error("Error fetching lines:", error);
    throw error;
  }
};

export const fetchLineData = async (lineNo: string): Promise<DashboardDataResponse> => {
  try {
    const response = await axios.get(`/api/get-line?lineNo=${lineNo}`);
    // Ensure we always return a single object (even if API returns an array)
    return Array.isArray(response.data) ? response.data[0] : response.data;
  } catch (error) {
    console.error(`Error fetching line ${lineNo} data:`, error);
    throw error;
  }
};

export const mapDashboardData = (data: DashboardDataResponse): DashboardData[] => {
  if (!data) return fallbackDashboardData;

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const topDefects = data.top_defect_code || "None";

  return [
    {
      id: "1",
      value: `${data.performance_efi ?? 0}%`,
      title: "PERFORMANCE EFI",
      timestamp,
      status: data.performance_efi > 0 ? "active" : "inactive",
      metrics: []
    },
    {
      id: "2",
      value: `${data.line_efi ?? 0}%`,
      title: "LINE EFI",
      timestamp,
      metrics: []
    },
    {
      id: "3",
      value: `${data.hourlyTargetAchieve ?? 0}/${data.perHourTarget ?? 0}`,
      title: "HOURLY TARGET/ACHIEVE",
      status: data.hourlyTargetAchieve > 0 ? "active" : "inactive",
      metrics: []
    },
    {
      id: "4",
      value: `${data.today_target_achieved ?? 0}/${data.today_target ?? 0}`,
      title: "TODAY TARGET/ACHIEVE",
      metrics: []
    },
    {
      id: "5",
      value: `${data.upto_now_achieved ?? 0}/${data.upto_now_target ?? 0}`,
      title: "UPTO NOW TARGET/ARCHIVE",
      metrics: []
    },
    {
      id: "6",
      value: data.totalCheckQty ?? 0,
      title: "TOTAL CHECK QTY",
      metrics: []
    },
    {
      id: "7",
      value: data.hourlyBalance ?? 0,
      title: "HOURLY BALANCE",
      metrics: []
    },
    {
      id: "8",
      value: data.today_balance ?? 0,
      title: "TODAY BALANCE",
      metrics: []
    },
    {
      id: "9",
      value: data.upto_now_balance ?? 0,
      title: "UPTO NOW BALANCE",
      metrics: []
    },
    {
      id: "10",
      value: data.total_defect_count ?? 0,
      title: "TOTAL DEFECT QTY",
      metrics: []
    },
    {
      id: "11",
      value: `${data.dhu ?? 0}%`,
      title: "DHU",
      metrics: []
    },
    {
      id: "12",
      value: topDefects,
      title: "TOP 3 DEFECTS",
      metrics: []
    }
  ];
};

export const fallbackDashboardData: DashboardData[] = [
  {
    id: "1",
    value: "0%",
    title: "PERFORMANCE EFI",
    timestamp: "--:--",
    status: "inactive",
    metrics: []
  },
  {
    id: "2",
    value: "0%",
    title: "LINE EFI",
    metrics: [],
    timestamp: "--:--"
  },
  {
    id: "3",
    value: "-/-",
    title: "HOURLY TARGET/ACHIEVE",
    metrics: [],
    status: "inactive"
  },
  {
    id: "4",
    value: "-/-",
    title: "TODAY TARGET/ACHIEVE",
    metrics: []
  },
  {
    id: "5",
    value: "-/-",
    title: "UPTO NOW TARGET/ARCHIVE",
    metrics: []
  },
  {
    id: "6",
    value: "-",
    title: "TOTAL CHECK QTY",
    metrics: []
  },
  {
    id: "7",
    value: "-",
    title: "HOURLY BALANCE",
    metrics: []
  },
  {
    id: "8",
    value: "-",
    title: "TODAY BALANCE",
    metrics: []
  },
  {
    id: "9",
    value: "-",
    title: "UPTO NOW BALANCE",
    metrics: []
  },
  {
    id: "10",
    value: "-",
    title: "TOTAL DEFECT QTY",
    metrics: []
  },
  {
    id: "11",
    value: "-%",
    title: "DHU",
    metrics: []
  },
  {
    id: "12",
    value: "-",
    title: "TOP 3 DEFECTS",
    metrics: []
  }
];