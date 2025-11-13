import api from "@/api/axiosInstance";
import {CustomerResponse} from "@/types"
export const checkPhoneVerified = async (phoneNumber: string): Promise<boolean> => {
    const response = await api.get<boolean>("/customers/verify-phone", {
        params: { phoneNumber }
    });
    return response.data;
};

export const getCustomerByPhoneNumber = async (phoneNumber: string): Promise<CustomerResponse> => {
    const response = await api.get<CustomerResponse>(`/customers/phone/${phoneNumber}`);
    return response.data;
};
