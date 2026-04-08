export type InvestmentType = "Stock" | "Crypto" | "Bond" | "MutualFund" | "RealEstate" | "Gold" | "Other";
export type InvestmentStatus = "Holding" | "Sold" | "PartialSold";

export interface InvestmentDto {
  investmentId: string;
  userId: string;
  portfolioId: string | null;
  portfolioName: string | null;
  name: string;
  type: InvestmentType;
  symbol: string | null;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  sellDate: string | null;
  status: InvestmentStatus;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  returnPercentage: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface PortfolioDto {
  portfolioId: string;
  userId: string;
  name: string;
  description: string | null;
  totalInvested: number;
  currentValue: number;
  totalProfitLoss: number;
  returnPercentage: number;
  investmentCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface InvestmentDashboard {
  totalInvested: number;
  currentValue: number;
  totalProfitLoss: number;
  totalReturnPercentage: number;
  portfolios: PortfolioDto[];
  recentInvestments: InvestmentDto[];
  topPerformers: InvestmentDto[];
  assetAllocation: Array<{
    type: InvestmentType;
    value: number;
    percentage: number;
  }>;
}

export interface CreateInvestmentRequest {
  portfolioId?: string | null;
  name: string;
  type: InvestmentType;
  symbol?: string | null;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  notes?: string | null;
}

export interface UpdateInvestmentRequest {
  portfolioId?: string | null;
  name?: string;
  type?: InvestmentType;
  symbol?: string | null;
  quantity?: number;
  currentPrice?: number;
  status?: InvestmentStatus;
  notes?: string | null;
}

export interface CreatePortfolioRequest {
  name: string;
  description?: string | null;
}

export interface UpdatePortfolioRequest {
  name?: string;
  description?: string | null;
}
