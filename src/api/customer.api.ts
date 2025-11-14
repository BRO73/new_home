import api from "@/api/axiosInstance";
import {CustomerResponse, CustomerRequest} from "@/types"
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

export const getCustomerByPhoneNumber = async (phoneNumber: string): Promise<CustomerResponse> => {
    const response = await api.get<CustomerResponse>(`/customers/phone/${phoneNumber}`);
    return response.data;
};

export const updateCustomer = async (
    id: number,
    data: CustomerRequest
): Promise<CustomerResponse> => {
    const response = await api.put<CustomerResponse>(`/customers/${id}`, data);
    return response.data;
};
