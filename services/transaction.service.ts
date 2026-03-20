import api from "@/lib/api";
import {
    CreateTransactionPayload,
    PaginatedResponse,
    PaymentStatus,
    Transaction,
    TransactionType,
} from "@/types/api.types";

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
    api.get("/tranaction", { params }).then((r) => r.data),

  getTransactionById: (id: string): Promise<Transaction> =>
    api.get(`/tranaction/${id}`).then((r) => r.data),

  createTransaction: (data: CreateTransactionPayload): Promise<Transaction> =>
    api.post("/tranaction/create", data).then((r) => r.data),

  updateTransaction: (
    id: string,
    data: CreateTransactionPayload,
  ): Promise<Transaction> =>
    api.put(`/tranaction/${id}`, data).then((r) => r.data),

  deleteTransaction: (id: string): Promise<void> =>
    api.delete(`/tranaction/${id}`).then((r) => r.data),
};
