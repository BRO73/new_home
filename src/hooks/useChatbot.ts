import { useState } from "react";
import api from "@/api/axiosInstance"; // axios instance bạn đã tạo

export type Role = "user" | "bot";

export interface ChatMessage {
    role: Role;
    text: string;
}

export interface ChatbotRequest {
    message: string;
    clientId?: string;
}

export interface ChatbotResponse {
    reply: string;
}

export const useChatbot = (clientId?: string) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async (message: string) => {
        if (!message.trim()) return;

        // 1️⃣ Thêm message của user vào state
        const userMsg: ChatMessage = { role: "user", text: message };
        setMessages((prev) => [...prev, userMsg]);

        setLoading(true);
        try {
            // 2️⃣ Gọi API chatbot
            const payload: ChatbotRequest = { message, clientId };
            const res = await api.post<ChatbotResponse>("/chatbot", payload);

            // 3️⃣ Thêm reply từ bot vào state
            const botMsg: ChatMessage = { role: "bot", text: res.data.reply };
            setMessages((prev) => [...prev, botMsg]);
        } catch (err: any) {
            console.error("[useChatbot] Error sending message:", err);
            const botMsg: ChatMessage = {
                role: "bot",
                text: "Xin lỗi, hiện tại tôi không thể trả lời. Vui lòng thử lại sau.",
            };
            setMessages((prev) => [...prev, botMsg]);
        } finally {
            setLoading(false);
        }
    };

    const resetChat = () => setMessages([]);

    return {
        messages,
        loading,
        sendMessage,
        resetChat,
    };
};
