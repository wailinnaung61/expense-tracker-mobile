import api from "@/lib/api";
import type { DashboardResponse } from "@/types/dashboard.types";

export const dashboardService = {
  /**
   * Get dashboard data for current month or specified month
   * @param month - Optional month in YYYY-MM format (e.g., "2026-04")
   */
  getDashboard: async (month?: string): Promise<DashboardResponse> => {
    const params = month ? `?month=${month}` : "";
    const response = await api.get<DashboardResponse>(`/api/Dashboard${params}`);
    return response.data;
  },
};
