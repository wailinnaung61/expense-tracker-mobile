import api from "@/lib/api";
import type {
  BudgetMonthlyResponse,
  BudgetDto,
  BudgetCategoryDto,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  CreateBudgetCategoryRequest,
  UpdateBudgetCategoryRequest,
  MessageResponse,
} from "@/types/budget.types";

export const budgetService = {
  /**
   * Get budget for a specific month
   * @param year - Year (e.g., 2026)
   * @param month - Month (1-12)
   */
  getBudgetByMonth: async (year: number, month: number): Promise<BudgetMonthlyResponse> => {
    const response = await api.get<BudgetMonthlyResponse>(`/api/budgets/${year}/${month}`);
    return response.data;
  },

  /**
   * Create a new budget for a month
   */
  createBudget: async (data: CreateBudgetRequest): Promise<BudgetDto> => {
    const response = await api.post<BudgetDto>("/api/budgets", data);
    return response.data;
  },

  /**
   * Update budget total allocated amount
   */
  updateBudget: async (budgetId: string, data: UpdateBudgetRequest): Promise<BudgetDto> => {
    const response = await api.put<BudgetDto>(`/api/budgets/${budgetId}`, data);
    return response.data;
  },

  /**
   * Add a category to budget
   */
  addBudgetCategory: async (
    budgetId: string,
    data: CreateBudgetCategoryRequest
  ): Promise<BudgetCategoryDto> => {
    const response = await api.post<BudgetCategoryDto>(
      `/api/budgets/${budgetId}/categories`,
      data
    );
    return response.data;
  },

  /**
   * Update budget category allocated amount
   */
  updateBudgetCategory: async (
    budgetCategoryId: string,
    data: UpdateBudgetCategoryRequest
  ): Promise<BudgetCategoryDto> => {
    const response = await api.put<BudgetCategoryDto>(
      `/api/budget-categories/${budgetCategoryId}`,
      data
    );
    return response.data;
  },

  /**
   * Remove a category from budget
   */
  removeBudgetCategory: async (budgetCategoryId: string): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(
      `/api/budget-categories/${budgetCategoryId}`
    );
    return response.data;
  },

  /**
   * Reset budget (set all spent to 0)
   */
  resetBudget: async (budgetId: string): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>(`/api/budgets/${budgetId}/reset`);
    return response.data;
  },

  /**
   * Delete budget
   */
  deleteBudget: async (budgetId: string): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/api/budgets/${budgetId}`);
    return response.data;
  },
};
