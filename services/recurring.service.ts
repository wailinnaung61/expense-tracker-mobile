import api from "@/lib/api";
import type {
  RecurringPaymentDto,
  CreateRecurringPaymentRequest,
  UpdateRecurringPaymentRequest,
  ProcessPaymentRequest,
} from "@/types/recurring.types";

export const recurringPaymentService = {
  /**
   * Get all recurring payments
   */
  getAllPayments: async (): Promise<RecurringPaymentDto[]> => {
    const response = await api.get<RecurringPaymentDto[]>("/api/recurring-payments");
    return response.data;
  },

  /**
   * Get upcoming payments (within next 30 days)
   */
  getUpcomingPayments: async (): Promise<RecurringPaymentDto[]> => {
    const response = await api.get<RecurringPaymentDto[]>("/api/recurring-payments/upcoming");
    return response.data;
  },

  /**
   * Get a specific recurring payment
   */
  getPayment: async (id: string): Promise<RecurringPaymentDto> => {
    const response = await api.get<RecurringPaymentDto>(`/api/recurring-payments/${id}`);
    return response.data;
  },

  /**
   * Create a new recurring payment
   */
  createPayment: async (data: CreateRecurringPaymentRequest): Promise<RecurringPaymentDto> => {
    const response = await api.post<RecurringPaymentDto>("/api/recurring-payments", data);
    return response.data;
  },

  /**
   * Update a recurring payment
   */
  updatePayment: async (
    id: string,
    data: UpdateRecurringPaymentRequest
  ): Promise<RecurringPaymentDto> => {
    const response = await api.put<RecurringPaymentDto>(`/api/recurring-payments/${id}`, data);
    return response.data;
  },

  /**
   * Delete a recurring payment
   */
  deletePayment: async (id: string): Promise<void> => {
    await api.delete(`/api/recurring-payments/${id}`);
  },

  /**
   * Process a payment (mark as paid and create transaction)
   */
  processPayment: async (id: string, data: ProcessPaymentRequest): Promise<void> => {
    await api.post(`/api/recurring-payments/${id}/process`, data);
  },

  /**
   * Skip next payment
   */
  skipPayment: async (id: string): Promise<RecurringPaymentDto> => {
    const response = await api.post<RecurringPaymentDto>(`/api/recurring-payments/${id}/skip`);
    return response.data;
  },
};
