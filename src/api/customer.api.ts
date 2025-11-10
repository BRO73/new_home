import api from "@/api/axiosInstance";

export const checkPhoneVerified = async (phoneNumber: string): Promise<boolean> => {
    const response = await api.get<boolean>("/customers/verify-phone", {
        params: { phoneNumber }
    });
    return response.data;
};
