export type TransactionType = "Income" | "Expense" | "Investment" | "Savings";
export type PaymentStatus = "Pending" | "Completed" | "Failed";

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  nextPageToken: string | null;
  previousPageToken: string | null;
}

export interface Category {
  categoryId: string;
  displayName: string;
  displayNameLower: string;
  type: TransactionType;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface Transaction {
  tranactionId: string;
  userId: string;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  amount: number;
  description: string;
  merchant: string;
  paymentMethod: string;
  status: PaymentStatus;
  tranactionDate: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string | null;
  note: string;
}

export interface User {
  userId: string;
  userName: string;
  email: string;
  phoneNumber: string;
  cognitoUserId: string;
  cognitoUserName: string;
  userPoolId: string;
  mfaEnabled: boolean;
  roleId: string;
  status: string;
  dailyLimit: number;
  currency: string;
  menus: { menuId: string; menuName: string }[];
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface SignInResponse {
  requiresMfa: boolean;
  tokens: AuthTokens | null;
  mfaChallenge: {
    session: string;
    challengeName: string;
    username: string;
    message: string;
  } | null;
}

export interface AggregationData {
  period: string;
  income: number;
  expense: number;
  saving: number;
  investment: number;
  transactionCount: number;
  periodStart?: string;
  periodEnd?: string;
}

export interface CategoryAggregation {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  type: TransactionType;
  total: number;
  transactionCount: number;
  percentage: number;
}

export interface CreateTransactionPayload {
  type: TransactionType;
  categoryId: string;
  amount: number;
  tranactionDate: string;
  status: PaymentStatus;
  description: string;
  note: string;
  imageUrl: string;
}

export interface CreateCategoryPayload {
  displayName: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface UpdateCategoryPayload {
  displayName: string;
  icon: string;
  color: string;
}
