export type RecurringFrequency = "Daily" | "Weekly" | "Monthly" | "Yearly";

export interface RecurringPaymentDto {
  recurringPaymentId: string;
  userId: string;
  name: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  frequency: RecurringFrequency;
  nextDueDate: string;
  lastPaidDate: string | null;
  isAutoPayment: boolean;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateRecurringPaymentRequest {
  name: string;
  categoryId: string;
  amount: number;
  frequency: RecurringFrequency;
  nextDueDate: string;
  isAutoPayment: boolean;
  notes?: string | null;
}

export interface UpdateRecurringPaymentRequest {
  name?: string;
  categoryId?: string;
  amount?: number;
  frequency?: RecurringFrequency;
  nextDueDate?: string;
  isAutoPayment?: boolean;
  isActive?: boolean;
  notes?: string | null;
}

export interface ProcessPaymentRequest {
  paidDate: string;
  amount: number;
}
