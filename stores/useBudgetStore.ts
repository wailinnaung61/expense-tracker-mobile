import { create } from "zustand";
import { budgetService } from "@/services";
import type { BudgetDto, BudgetMonthlyResponse, BudgetCategoryDto } from "@/types/budget.types";

interface BudgetState {
  currentBudget: BudgetDto | null;
  availableCategories: any[];
  isLoading: boolean;
  error: string | null;
  selectedYear: number;
  selectedMonth: number;
  
  // Actions
  fetchBudget: (year: number, month: number) => Promise<void>;
  createBudget: (month: string, totalAllocated: number) => Promise<BudgetDto>;
  updateBudget: (budgetId: string, totalAllocated: number) => Promise<BudgetDto>;
  addCategory: (budgetId: string, categoryId: string, allocatedAmount: number) => Promise<BudgetCategoryDto>;
  updateCategory: (categoryId: string, allocatedAmount: number) => Promise<BudgetCategoryDto>;
  removeCategory: (categoryId: string) => Promise<void>;
  resetBudget: (budgetId: string) => Promise<void>;
  deleteBudget: (budgetId: string) => Promise<void>;
  setSelectedMonth: (year: number, month: number) => void;
  clearError: () => void;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  currentBudget: null,
  availableCategories: [],
  isLoading: false,
  error: null,
  selectedYear: new Date().getFullYear(),
  selectedMonth: new Date().getMonth() + 1,

  fetchBudget: async (year: number, month: number) => {
    set({ isLoading: true, error: null });
    try {
      const response: BudgetMonthlyResponse = await budgetService.getBudgetByMonth(year, month);
      set({
        currentBudget: response.budget,
        availableCategories: response.availableCategories,
        selectedYear: year,
        selectedMonth: month,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch budget";
      set({ error: errorMessage, isLoading: false });
    }
  },

  createBudget: async (month: string, totalAllocated: number) => {
    set({ isLoading: true, error: null });
    try {
      const budget = await budgetService.createBudget({ month, totalAllocated });
      set({ currentBudget: budget, isLoading: false });
      return budget;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create budget";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateBudget: async (budgetId: string, totalAllocated: number) => {
    set({ isLoading: true, error: null });
    try {
      const budget = await budgetService.updateBudget(budgetId, { totalAllocated });
      set({ currentBudget: budget, isLoading: false });
      return budget;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update budget";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  addCategory: async (budgetId: string, categoryId: string, allocatedAmount: number) => {
    set({ isLoading: true, error: null });
    try {
      const category = await budgetService.addBudgetCategory(budgetId, {
        categoryId,
        allocatedAmount,
      });
      
      // Refresh budget
      const { selectedYear, selectedMonth } = get();
      await get().fetchBudget(selectedYear, selectedMonth);
      
      set({ isLoading: false });
      return category;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to add category";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateCategory: async (categoryId: string, allocatedAmount: number) => {
    set({ isLoading: true, error: null });
    try {
      const category = await budgetService.updateBudgetCategory(categoryId, { allocatedAmount });
      
      // Update in current budget
      set((state) => ({
        currentBudget: state.currentBudget
          ? {
              ...state.currentBudget,
              categories: state.currentBudget.categories.map((c) =>
                c.budgetCategoryId === categoryId ? category : c
              ),
            }
          : null,
        isLoading: false,
      }));
      
      return category;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update category";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  removeCategory: async (categoryId: string) => {
    set({ isLoading: true, error: null });
    try {
      await budgetService.removeBudgetCategory(categoryId);
      
      // Refresh budget
      const { selectedYear, selectedMonth } = get();
      await get().fetchBudget(selectedYear, selectedMonth);
      
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to remove category";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  resetBudget: async (budgetId: string) => {
    set({ isLoading: true, error: null });
    try {
      await budgetService.resetBudget(budgetId);
      
      // Refresh budget
      const { selectedYear, selectedMonth } = get();
      await get().fetchBudget(selectedYear, selectedMonth);
      
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to reset budget";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteBudget: async (budgetId: string) => {
    set({ isLoading: true, error: null });
    try {
      await budgetService.deleteBudget(budgetId);
      set({ currentBudget: null, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete budget";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  setSelectedMonth: (year: number, month: number) => {
    set({ selectedYear: year, selectedMonth: month });
    get().fetchBudget(year, month);
  },

  clearError: () => set({ error: null }),
}));
