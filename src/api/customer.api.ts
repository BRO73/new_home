import api from "@/api/axiosInstance";
import { CustomerResponse } from "@/types";

export const checkPhoneVerified = async (phoneNumber: string): Promise<boolean> => {
    const response = await api.get<boolean>("/customers/verify-phone", {
        params: { phoneNumber }
    });
    return response.data;
};
export const getCustomerByPhone = async (phone: string): Promise<CustomerResponse | null> => {
    const { data } = await api.get<CustomerResponse | null>("/customers/by-phone", {
        params: { phone }
    });
    return data; // null nếu không tìm thấy
};
