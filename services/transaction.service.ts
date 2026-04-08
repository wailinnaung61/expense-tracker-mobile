import api from "@/lib/api";
import {
    CreateTransactionPayload,
    PaginatedResponse,
    PaymentStatus,
    Transaction,
    TransactionType,
} from "@/types/api.types";
import { AxiosError } from "axios";

async function requestWithPathFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return fallback();
    }
    throw error;
  }
}

export const transactionService = {
  getTransactions: (params?: {
    type?: TransactionType;
    status?: PaymentStatus;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    keyword?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Transaction>> =>
    requestWithPathFallback(
      () => api.get("/api/transactions", { params }).then((r) => r.data),
      () => api.get("/api/tranaction", { params }).then((r) => r.data),
    ),

  getTransactionById: (id: string): Promise<Transaction> =>
    requestWithPathFallback(
      () => api.get(`/api/transactions/${id}`).then((r) => r.data),
      () => api.get(`/api/tranaction/${id}`).then((r) => r.data),
    ),

  createTransaction: (data: CreateTransactionPayload): Promise<Transaction> =>
    requestWithPathFallback(
      () => api.post("/api/transactions/create", data).then((r) => r.data),
      () => api.post("/api/tranaction/create", data).then((r) => r.data),
    ),

  updateTransaction: (
    id: string,
    data: CreateTransactionPayload,
  ): Promise<Transaction> =>
    requestWithPathFallback(
      () => api.put(`/api/transactions/${id}`, data).then((r) => r.data),
      () => api.put(`/api/tranaction/${id}`, data).then((r) => r.data),
    ),

  deleteTransaction: (id: string): Promise<void> =>
    requestWithPathFallback(
      () => api.delete(`/api/transactions/${id}`).then((r) => r.data),
      () => api.delete(`/api/tranaction/${id}`).then((r) => r.data),
    ),
};
