import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth"; // Import hook "chuẩn" ở trên

/**
 * Component "Bảo vệ":
 * 1. Dùng `useAuth` để kiểm tra `isAuthenticated`.
 * 2. Nếu chưa, thực hiện logic lưu `pendingTableId` của bạn và "đá" về `/otp-login`.
 * 3. Nếu rồi, cho phép vào (render <Outlet />).
 */
const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth(); // Lấy trạng thái từ Context

  if (!isAuthenticated) {
    // === LOGIC GỐC CỦA BẠN (Đã chuẩn) ===
    const params = new URLSearchParams(location.search);
    const tableId = params.get("tableId");

    // Chỉ lưu tableId nếu đang cố truy cập /menu-order hoặc /cart
    if (
      (location.pathname === "/menu-order" || location.pathname === "/cart") &&
      tableId
    ) {
      console.log("Chưa login, lưu pendingTableId:", tableId);
      localStorage.setItem("pendingTableId", tableId);
    } else {
      // Nếu vào trang protected khác không có tableId, xóa pending cũ
      localStorage.removeItem("pendingTableId");
    }
    // === HẾT LOGIC GỐC ===

    // Chuyển hướng đến trang login của bạn
    return <Navigate to="/otp-login" state={{ from: location }} replace />;
  }

  // Đã đăng nhập: Render component con (MenuOrderPage, CartItem...)
  return <Outlet />;
};

export default ProtectedRoute;
