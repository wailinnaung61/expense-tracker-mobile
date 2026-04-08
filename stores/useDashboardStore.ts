import { create } from "zustand";
import { dashboardService } from "@/services";
import type { DashboardResponse } from "@/types/dashboard.types";

interface DashboardState {
  dashboard: DashboardResponse | null;
  isLoading: boolean;
  error: string | null;
  selectedMonth: string | null; // YYYY-MM format
  lastRefreshed: Date | null;
  
  // Actions
  fetchDashboard: (month?: string) => Promise<void>;
  setSelectedMonth: (month: string | null) => void;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dashboard: null,
  isLoading: false,
  error: null,
  selectedMonth: null,
  lastRefreshed: null,

  fetchDashboard: async (month?: string) => {
    set({ isLoading: true, error: null });
    try {
      const dashboard = await dashboardService.getDashboard(month);
      set({
        dashboard,
        selectedMonth: month || null,
        isLoading: false,
        lastRefreshed: new Date(),
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch dashboard";
      set({ error: errorMessage, isLoading: false });
    }
  },

  setSelectedMonth: (month: string | null) => {
    set({ selectedMonth: month });
    get().fetchDashboard(month || undefined);
  },

  refresh: async () => {
    const { selectedMonth } = get();
    await get().fetchDashboard(selectedMonth || undefined);
  },

  clearError: () => set({ error: null }),
}));
