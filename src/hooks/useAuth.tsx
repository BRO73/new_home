import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import api from "@/api/axiosInstance"; // Import axios instance của bạn

// Định nghĩa "hình dạng" của Context
interface AuthContextType {
  isAuthenticated: boolean; // Trạng thái đăng nhập (true/false)
  token: string | null; // Token (để debug hoặc dùng nếu cần)
  login: (token: string) => void; // Hàm để đăng nhập
  logout: () => void; // Hàm để đăng xuất
}

// Tạo Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Component Provider: Bọc toàn bộ ứng dụng của bạn (trong main.tsx)
 * Nó sẽ quản lý trạng thái token và cung cấp các hàm login/logout.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 1. Lấy token từ localStorage khi tải trang lần đầu
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken")
  );

  // 2. Tự động cập nhật axios header VÀ localStorage mỗi khi token thay đổi
  useEffect(() => {
    if (token) {
      // Gán token vào header cho mọi request
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("accessToken", token);
    } else {
      // Xóa token khỏi header
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("accessToken");
    }
  }, [token]); // Chạy lại mỗi khi 'token' thay đổi

  // 3. Hàm đăng nhập (dùng useCallback để tối ưu)
  const login = useCallback((newToken: string) => {
    setToken(newToken);
  }, []); // Hàm này không bao giờ thay đổi

  // 4. Hàm đăng xuất (dùng useCallback để tối ưu)
  const logout = useCallback(() => {
    setToken(null);
    // Bạn có thể thêm logic redirect về /login tại đây nếu muốn
    // (nhưng thường để component tự xử lý)
  }, []); // Hàm này không bao giờ thay đổi

  // 5. Tối ưu hóa giá trị context bằng useMemo
  // Chỉ tính toán lại khi 'token' thay đổi
  const contextValue = useMemo(
    () => ({
      isAuthenticated: !!token, // '!!' chuyển string (hoặc null) thành boolean
      token: token,
      login,
      logout,
    }),
    [token, login, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

/**
 * Custom Hook: `useAuth`
 * Các component con (như ProtectedRoute) sẽ dùng hook này
 * để lấy trạng thái và các hàm (isAuthenticated, login, logout).
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Đảm bảo hook được dùng bên trong <AuthProvider>
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
