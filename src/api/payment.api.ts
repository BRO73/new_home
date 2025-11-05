import api from "./axiosInstance";

// Request DTO
export interface PaymentRequestDTO {
  orderId: number;
  returnUrl: string;
  cancelUrl: string;
}

// Response DTO
export interface PaymentResponseDTO {
  transactionCode: string;
  checkoutUrl: string;
  paymentStatus: string;
  orderId: number;
}

/**
 * Tạo payment link cho order
 * @param request - Payment request với orderId, returnUrl, cancelUrl
 * @returns Payment response với paymentUrl
 */
export const createPaymentLink = async (
  request: PaymentRequestDTO
): Promise<PaymentResponseDTO> => {
  const response = await api.post<PaymentResponseDTO>(
    "/payments/create",
    request
  );

  return response.data;
};
