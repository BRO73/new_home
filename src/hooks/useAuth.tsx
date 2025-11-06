import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import api from "@/api/axiosInstance";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string, phone?: string) => void; // Thêm phone parameter
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("accessToken")
  );

  // Hàm đồng bộ hoá authentication state
  const syncAuthState = useCallback(() => {
    const currentToken = localStorage.getItem("accessToken");
    const currentPhone = localStorage.getItem("userPhone");

    // Nếu không có token nhưng có phone -> xoá phone
    if (!currentToken && currentPhone) {
      localStorage.removeItem("userPhone");
      console.log("Đồng bộ: Xoá userPhone do thiếu accessToken");
    }
    
    // Nếu có token nhưng không có phone -> xoá token (trường hợp hiếm)
    if (currentToken && !currentPhone) {
      localStorage.removeItem("accessToken");
      setToken(null);
      console.log("Đồng bộ: Xoá accessToken do thiếu userPhone");
    }

    return { token: currentToken, phone: currentPhone };
  }, []);

  useEffect(() => {
    // Đồng bộ state khi component mount
    const { token: syncedToken } = syncAuthState();
    if (syncedToken !== token) {
      setToken(syncedToken);
    }
  }, [syncAuthState, token]);

  useEffect(() => {
    const { token: currentToken } = syncAuthState();
    
    if (currentToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${currentToken}`;
      console.log("Đã thiết lập Authorization header");
    } else {
      delete api.defaults.headers.common["Authorization"];
      console.log("Đã xoá Authorization header");
    }
  }, [token, syncAuthState]);

  // Lắng nghe sự kiện storage change từ các tab khác
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "accessToken" || e.key === "userPhone") {
        console.log(`Storage changed: ${e.key}`, e.newValue);
        syncAuthState();
        
        // Cập nhật token state nếu accessToken thay đổi
        if (e.key === "accessToken") {
          setToken(e.newValue);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [syncAuthState]);

  const login = useCallback((newToken: string, phone?: string) => {
    localStorage.setItem("accessToken", newToken);
    if (phone) {
      localStorage.setItem("userPhone", phone);
    }
    setToken(newToken);
    console.log("Đăng nhập thành công, đã lưu accessToken và userPhone");
  }, []);

  const logout = useCallback(() => {
    // Xoá cả accessToken và userPhone cùng lúc
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userPhone");
    setToken(null);
    console.log("Đăng xuất: Đã xoá accessToken và userPhone");
  }, []);

  const contextValue = useMemo(
    () => ({
      isAuthenticated: !!token,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};