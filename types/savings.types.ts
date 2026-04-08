export type GoalStatus = "Active" | "Completed" | "Cancelled";
export type ContributionFrequency = "Daily" | "Weekly" | "Monthly" | "Yearly" | "OneTime";

export interface SavingGoalDto {
  savingGoalId: string;
  userId: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  status: GoalStatus;
  contributionFrequency: ContributionFrequency | null;
  contributionAmount: number | null;
  createdAt: string;
  updatedAt: string | null;
  completedAt: string | null;
  progress: number;
  remainingAmount: number;
  daysRemaining: number | null;
}

export interface ContributionDto {
  contributionId: string;
  savingGoalId: string;
  amount: number;
  note: string | null;
  contributionDate: string;
  createdAt: string;
}

export interface CreateSavingGoalRequest {
  goalName: string;
  targetAmount: number;
  deadline?: string | null;
  contributionFrequency?: ContributionFrequency | null;
  contributionAmount?: number | null;
}

export interface UpdateSavingGoalRequest {
  goalName?: string;
  targetAmount?: number;
  deadline?: string | null;
  contributionFrequency?: ContributionFrequency | null;
  contributionAmount?: number | null;
  status?: GoalStatus;
}

export interface AddContributionRequest {
  amount: number;
  note?: string | null;
  contributionDate?: string;
}

export interface SavingGoalDetailResponse {
  goal: SavingGoalDto;
  contributions: ContributionDto[];
  totalContributions: number;
}
