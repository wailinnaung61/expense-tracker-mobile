import api from "@/lib/api";
import type {
  SavingGoalDto,
  ContributionDto,
  CreateSavingGoalRequest,
  UpdateSavingGoalRequest,
  AddContributionRequest,
  SavingGoalDetailResponse,
} from "@/types/savings.types";

export const savingsService = {
  /**
   * Get all saving goals for current user
   */
  getAllGoals: async (): Promise<SavingGoalDto[]> => {
    const response = await api.get<SavingGoalDto[]>("/api/saving-goals");
    return response.data;
  },

  /**
   * Get a specific saving goal with contributions
   */
  getGoalDetail: async (goalId: string): Promise<SavingGoalDetailResponse> => {
    const response = await api.get<SavingGoalDetailResponse>(`/api/saving-goals/${goalId}`);
    return response.data;
  },

  /**
   * Create a new saving goal
   */
  createGoal: async (data: CreateSavingGoalRequest): Promise<SavingGoalDto> => {
    const response = await api.post<SavingGoalDto>("/api/saving-goals", data);
    return response.data;
  },

  /**
   * Update a saving goal
   */
  updateGoal: async (goalId: string, data: UpdateSavingGoalRequest): Promise<SavingGoalDto> => {
    const response = await api.put<SavingGoalDto>(`/api/saving-goals/${goalId}`, data);
    return response.data;
  },

  /**
   * Delete a saving goal
   */
  deleteGoal: async (goalId: string): Promise<void> => {
    await api.delete(`/api/saving-goals/${goalId}`);
  },

  /**
   * Add a contribution to a saving goal
   */
  addContribution: async (
    goalId: string,
    data: AddContributionRequest
  ): Promise<ContributionDto> => {
    const response = await api.post<ContributionDto>(
      `/api/saving-goals/${goalId}/contributions`,
      data
    );
    return response.data;
  },

  /**
   * Get all contributions for a saving goal
   */
  getContributions: async (goalId: string): Promise<ContributionDto[]> => {
    const response = await api.get<ContributionDto[]>(
      `/api/saving-goals/${goalId}/contributions`
    );
    return response.data;
  },

  /**
   * Delete a contribution
   */
  deleteContribution: async (contributionId: string): Promise<void> => {
    await api.delete(`/api/contributions/${contributionId}`);
  },
};
