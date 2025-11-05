import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy tableId từ URL
  const params = new URLSearchParams(location.search);
  const tableId = params.get("tableId");
  const orderId = params.get("orderId");

  const [countdown, setCountdown] = useState(3); // Đếm ngược 3 giây

  useEffect(() => {
    // Hết 3 giây thì chuyển về trang live-order
    const timer = setTimeout(() => {
      if (tableId) {
        navigate(`/live-order?tableId=${tableId}`);
      } else {
        navigate("/"); // Fallback về trang chủ nếu không có tableId
      }
    }, 3000);

    // Hẹn giờ đếm ngược
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [navigate, tableId]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
      <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Thanh toán thành công!
      </h1>
      <p className="text-gray-600">Đơn hàng #{orderId} đã được thanh toán.</p>
      <p className="text-gray-500 text-sm mt-6">
        Đang tự động chuyển về trang đơn hàng trong {countdown}s...
      </p>
    </div>
  );
};

export default PaymentSuccessPage;
