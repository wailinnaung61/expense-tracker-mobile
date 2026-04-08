import { create } from "zustand";
import { transactionService } from "@/services";
import type { Transaction, PaginatedResponse } from "@/types/api.types";

interface TransactionFilters {
  type?: string;
  categoryId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

interface TransactionState {
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: TransactionFilters;
  
  // Actions
  fetchTransactions: (pageNumber?: number) => Promise<void>;
  fetchTransaction: (id: string) => Promise<void>;
  createTransaction: (data: any) => Promise<Transaction>;
  updateTransaction: (id: string, data: any) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  setFilters: (filters: TransactionFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
}

const DEFAULT_PAGE_SIZE = 20;

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  currentTransaction: null,
  isLoading: false,
  error: null,
  pagination: {
    pageNumber: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  filters: {},

  fetchTransactions: async (pageNumber = 1) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const response: PaginatedResponse<Transaction> = await transactionService.getTransactions({
        ...filters,
        pageNumber,
        pageSize: DEFAULT_PAGE_SIZE,
      });

      set({
        transactions: response.items,
        pagination: {
          pageNumber: response.pageNumber,
          pageSize: response.pageSize,
          totalCount: response.totalCount,
          totalPages: response.totalPages,
          hasNextPage: response.hasNextPage,
          hasPreviousPage: response.hasPreviousPage,
        },
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch transactions";
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchTransaction: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const transaction = await transactionService.getTransaction(id);
      set({ currentTransaction: transaction, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch transaction";
      set({ error: errorMessage, isLoading: false });
    }
  },

  createTransaction: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const transaction = await transactionService.createTransaction(data);
      
      // Refresh transactions list
      await get().fetchTransactions(get().pagination.pageNumber);
      
      set({ isLoading: false });
      return transaction;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create transaction";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateTransaction: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const transaction = await transactionService.updateTransaction(id, data);
      
      // Update in list
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.tranactionId === id ? transaction : t
        ),
        currentTransaction: state.currentTransaction?.tranactionId === id ? transaction : state.currentTransaction,
        isLoading: false,
      }));
      
      return transaction;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update transaction";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteTransaction: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await transactionService.deleteTransaction(id);
      
      // Remove from list
      set((state) => ({
        transactions: state.transactions.filter((t) => t.tranactionId !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete transaction";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  setFilters: (filters: TransactionFilters) => {
    set({ filters });
    // Auto-fetch with new filters
    get().fetchTransactions(1);
  },

  clearFilters: () => {
    set({ filters: {} });
    get().fetchTransactions(1);
  },

  clearError: () => set({ error: null }),
}));
