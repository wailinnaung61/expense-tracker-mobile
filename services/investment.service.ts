import api from "@/lib/api";
import type {
  InvestmentDto,
  PortfolioDto,
  InvestmentDashboard,
  CreateInvestmentRequest,
  UpdateInvestmentRequest,
  CreatePortfolioRequest,
  UpdatePortfolioRequest,
} from "@/types/investment.types";
import type { PaginatedResponse } from "@/types/api.types";

export const investmentService = {
  // ===== Dashboard =====
  /**
   * Get investment dashboard summary
   */
  getDashboard: async (): Promise<InvestmentDashboard> => {
    const response = await api.get<InvestmentDashboard>("/api/investments/dashboard");
    return response.data;
  },

  // ===== Investments =====
  /**
   * Get all investments with optional filters
   */
  getAllInvestments: async (params?: {
    type?: string;
    status?: string;
    portfolioId?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<InvestmentDto>> => {
    const response = await api.get<PaginatedResponse<InvestmentDto>>("/api/investments", {
      params,
    });
    return response.data;
  },

  /**
   * Get a specific investment
   */
  getInvestment: async (id: string): Promise<InvestmentDto> => {
    const response = await api.get<InvestmentDto>(`/api/investments/${id}`);
    return response.data;
  },

  /**
   * Create a new investment
   */
  createInvestment: async (data: CreateInvestmentRequest): Promise<InvestmentDto> => {
    const response = await api.post<InvestmentDto>("/api/investments", data);
    return response.data;
  },

  /**
   * Update an investment
   */
  updateInvestment: async (
    id: string,
    data: UpdateInvestmentRequest
  ): Promise<InvestmentDto> => {
    const response = await api.put<InvestmentDto>(`/api/investments/${id}`, data);
    return response.data;
  },

  /**
   * Delete an investment
   */
  deleteInvestment: async (id: string): Promise<void> => {
    await api.delete(`/api/investments/${id}`);
  },

  // ===== Portfolios =====
  /**
   * Get all portfolios
   */
  getAllPortfolios: async (): Promise<PortfolioDto[]> => {
    const response = await api.get<PortfolioDto[]>("/api/portfolios");
    return response.data;
  },

  /**
   * Get a specific portfolio
   */
  getPortfolio: async (id: string): Promise<PortfolioDto> => {
    const response = await api.get<PortfolioDto>(`/api/portfolios/${id}`);
    return response.data;
  },

  /**
   * Create a new portfolio
   */
  createPortfolio: async (data: CreatePortfolioRequest): Promise<PortfolioDto> => {
    const response = await api.post<PortfolioDto>("/api/portfolios", data);
    return response.data;
  },

  /**
   * Update a portfolio
   */
  updatePortfolio: async (id: string, data: UpdatePortfolioRequest): Promise<PortfolioDto> => {
    const response = await api.put<PortfolioDto>(`/api/portfolios/${id}`, data);
    return response.data;
  },

  /**
   * Delete a portfolio
   */
  deletePortfolio: async (id: string): Promise<void> => {
    await api.delete(`/api/portfolios/${id}`);
  },
};
