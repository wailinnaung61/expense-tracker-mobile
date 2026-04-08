export interface BudgetCategoryDto {
  budgetCategoryId: string;
  budgetId: string;
  categoryId: string;
  categoryName: string;
  allocatedAmount: number;
  spent: number;
  remaining: number;
  percentage: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface BudgetDto {
  budgetId: string;
  userId: string;
  month: string;
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  categories: BudgetCategoryDto[];
  createdAt: string;
  updatedAt: string | null;
}

export interface BudgetMonthlyResponse {
  budget: BudgetDto | null;
  availableCategories: AvailableCategory[];
}

export interface AvailableCategory {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
}

export interface CreateBudgetRequest {
  month: string; // YYYY-MM format
  totalAllocated: number;
}

export interface UpdateBudgetRequest {
  totalAllocated: number;
}

export interface CreateBudgetCategoryRequest {
  categoryId: string;
  allocatedAmount: number;
}

export interface UpdateBudgetCategoryRequest {
  allocatedAmount: number;
}

export interface MessageResponse {
  message: string;
}
