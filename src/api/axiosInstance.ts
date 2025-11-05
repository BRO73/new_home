import axios from "axios";

// Create Axios instance
const api = axios.create({
  baseURL: "http://192.168.1.68:8082/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Danh sách các endpoint PUBLIC không cần token
const PUBLIC_ENDPOINTS = [
  "/auth/login",
  "/auth/otp",
  "/auth/verify-otp",
  "/auth/register",
  "/auth/forgot-password",
  "/menu",
  "/categories",
];

// Kiểm tra xem endpoint có phải là public không
const isPublicEndpoint = (url: string): boolean => {
  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

// --- Request Interceptor ---
// Tự động đính kèm token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("[Request Interceptor] Error:", error);
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
// Xử lý lỗi tập trung
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { config, response } = error;

    if (!response) {
      console.error(
        "[Response Interceptor] Network Error or No Response:",
        error
      );
      return Promise.reject(error);
    }

    console.error(
      `[Response Interceptor] Error: ${response.status}`,
      error.message
    );

    // === BỎ HẾT LOGIC 401 AUTO-CLEAR TOKEN ===
    // Đang test, để component tự xử lý
    if (response.status === 401) {
      console.warn(`[401] Unauthorized: ${config.url || "unknown"}`);
      // KHÔNG xóa token, KHÔNG redirect
    }

    // Các lỗi khác: 400, 403, 404, 500... → pass cho component xử lý
    return Promise.reject(error);
  }
);

export default api;
