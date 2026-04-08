import api from "@/lib/api";
import type { ChatResponse } from "@/types/chat.types";

export const chatService = {
  /**
   * Send a message to the AI chatbot
   * The chatbot can help with:
   * - Adding transactions
   * - Viewing summaries
   * - Managing categories
   * - Setting up recurring payments
   */
  sendMessage: async (message: string): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>("/api/Chat", { message });
    return response.data;
  },
};
