// src/api/chatbot.api.ts
import api from "@/api/axiosInstance"; // instance bạn tạo
import { ChatbotRequest, ChatbotResponse } from "@/types/index.ts";

export const sendChatMessage = async (
    request: ChatbotRequest
): Promise<ChatbotResponse> => {
    try {
        const { data } = await api.post<ChatbotResponse>("/chatbot", request);
        return data;
    } catch (error) {
        console.error("[Chatbot API] sendChatMessage error:", error);
        throw error;
    }
};
