export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  totalInvestment: number;
  netBalance: number;
  transactionCount: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  total: number;
  percentage: number;
  transactionCount: number;
}

export interface MonthlyTrend {
  month: string; // YYYY-MM format
  income: number;
  expense: number;
  savings: number;
  investment: number;
}

export interface RecentTransaction {
  transactionId: string;
  type: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
  description: string;
  merchant: string;
  transactionDate: string;
  imageUrl: string | null;
}

export interface UpcomingBill {
  recurringPaymentId: string;
  name: string;
  categoryName: string;
  categoryIcon: string;
  amount: number;
  nextDueDate: string;
  daysUntilDue: number;
  isAutoPayment: boolean;
}

export interface BudgetSummary {
  budgetId: string | null;
  month: string;
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  percentageUsed: number;
  topCategories: Array<{
    categoryName: string;
    categoryIcon: string;
    allocated: number;
    spent: number;
    percentage: number;
  }>;
}

export interface SavingsSummary {
  totalGoals: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  totalProgress: number;
  activeGoals: number;
  completedGoals: number;
}

export interface InvestmentSummary {
  totalInvested: number;
  currentValue: number;
  totalProfitLoss: number;
  totalReturnPercentage: number;
  holdingsCount: number;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrends: MonthlyTrend[];
  recentTransactions: RecentTransaction[];
  upcomingBills: UpcomingBill[];
  budgetSnapshot: BudgetSummary;
  savingsSnapshot: SavingsSummary;
  investmentSnapshot: InvestmentSummary;
}
