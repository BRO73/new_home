import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";

// 1. IMPORT API VÀ TYPES MỚI
import {
  getActiveOrdersByTable,
  createOrder,
  addItemsToOrder,
} from "@/api/order.api";
import {
  OrderResponse,
  CreateOrderRequest,
  OrderDetailRequest,
} from "@/types/index";

// === ĐỔI TÊN COMPONENT CHO ĐÚNG ===
const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    clearCart,
  } = useCart();

  // 2. STATE MỚI ĐỂ QUẢN LÝ API VÀ LOGIC
  const [tableId, setTableId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeOrders, setActiveOrders] = useState<OrderResponse[]>([]); // State quan trọng nhất

  // State để xử lý nghiệp vụ API (chặn click nhiều lần)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 3. EFFECT ĐỂ LẤY DỮ LIỆU TỪ API
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tableIdFromUrl = params.get("tableId");

    if (!tableIdFromUrl) {
      setError("Không tìm thấy tableId trên URL.");
      setLoading(false);
      return;
    }

    const id = Number(tableIdFromUrl);
    setTableId(id);

    const loadActiveOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        // GỌI API THEN CHỐT
        const orders = await getActiveOrdersByTable(id);
        setActiveOrders(orders);
      } catch (err) {
        console.error("Lỗi khi tải active orders:", err);
        setError("Không thể tải thông tin hóa đơn tại bàn.");
      } finally {
        setLoading(false);
      }
    };

    loadActiveOrders();
  }, [location.search]);

  // 4. CHUẨN BỊ DỮ LIỆU ĐỂ GỬI API
  // Biến đổi cartItems (từ useCart) sang OrderDetailRequest[] (loại DTO mà API cần)
  const itemsToSubmit: OrderDetailRequest[] = useMemo(() => {
    return cartItems.map((item) => ({
      menuItemId: Number(item.id), // Đảm bảo ID là number
      quantity: item.quantity,
      specialRequirements: "", // (TODO: Thêm ô ghi chú cho từng món nếu cần)
    }));
  }, [cartItems]);

  // 5. HANDLERS GỌI API (THAY THẾ CHO LOGIC LOCAL CŨ)

  /**
   * CASE 1: Bàn trống, tạo 1 order mới
   */
  const handleCreateNewOrder = async () => {
    if (!tableId || itemsToSubmit.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const newOrderRequest: CreateOrderRequest = {
      tableId: tableId,
      items: itemsToSubmit,
      note: "Khách tự order tại bàn",
    };

    try {
      const createdOrder = await createOrder(newOrderRequest);
      // Đã tạo thành công!
      console.log("Tạo order thành công:", createdOrder);
      clearCart(); // Xóa giỏ hàng local

      // ⭐️ SỬA LỖI 1: Điều hướng đến trang TableStatus (Order List)
      navigate(`/table-status?tableId=${tableId}`);
    } catch (err) {
      console.error("Lỗi tạo order:", err);
      setError("Không thể tạo đơn hàng. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  };

  /**
   * CASE 2: Bàn đã có order, thêm món vào 1 order CÓ SẴN
   */
  const handleAddToExistingOrder = async (orderId: number) => {
    if (itemsToSubmit.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const updatedOrder = await addItemsToOrder(orderId, itemsToSubmit);
      // Đã thêm món thành công!
      console.log("Thêm món thành công:", updatedOrder);
      clearCart(); // Xóa giỏ hàng local

      // ⭐️ SỬA LỖI 2: Điều hướng đến trang TableStatus (Order List)
      navigate(`/table-status?tableId=${tableId}`);
    } catch (err) {
      console.error(`Lỗi thêm món vào order ${orderId}:`, err);
      setError("Không thể thêm món vào đơn hàng. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  };

  // 6. CÁC HANDLER CỦA GIỎ HÀNG (GIỮ NGUYÊN)
  const handleIncrease = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (item) {
      updateQuantity(id, item.quantity + 1);
    }
  };

  const handleDecrease = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (item) {
      if (item.quantity > 1) {
        updateQuantity(id, item.quantity - 1);
      } else {
        removeFromCart(id);
      }
    }
  };

  const handleRemove = (id: string) => {
    removeFromCart(id);
  };

  // === RENDER LOGIC ===
  const subtotal = getTotalPrice();
  const tax = Math.round(subtotal * 0.1); // (VAT nên được tính ở BE)
  const total = subtotal + tax;

  const renderLoadingOrError = () => {
    if (loading) {
      return (
        <div className="text-center py-20">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">
            Đang tải thông tin bàn...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-20">
          <div className="text-7xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Có lỗi xảy ra
          </h2>
          <p className="text-gray-600 mb-8 text-lg">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            size="lg"
            className="bg-amber-500 hover:bg-amber-600"
          >
            Tải lại trang
          </Button>
        </div>
      );
    }

    if (cartItems.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="text-7xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Giỏ hàng của bạn đang trống.
          </p>
          <Button
            onClick={() => navigate(`/menu-order?tableId=${tableId}`)}
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 text-base font-semibold"
          >
            Quay lại thực đơn
          </Button>
        </div>
      );
    }

    return null; // Không có lỗi, không loading, có item -> render nội dung
  };

  /**
   * Component con để render các món đã có trong hóa đơn (từ API)
   */
  const ConfirmedItemsList: React.FC<{ orders: OrderResponse[] }> = ({
    orders,
  }) => (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-2xl shadow-sm border-2 border-green-200 p-5"
        >
          <h3 className="text-lg font-bold text-green-800 mb-3">
            Đơn hàng #{order.orderNumber} (
            {order.customerName ||
              (order.customerUserId
                ? `của Khách ${order.customerUserId}`
                : "Chưa ai nhận")}
            )
          </h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <span className="text-gray-700">
                  {item.quantity} x {item.menuItem.name}
                </span>
                <span className="text-gray-900 font-semibold">
                  {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                </span>
              </div>
            ))}
          </div>
          <div className="h-px bg-gray-200 my-3"></div>
          <div className="flex justify-between items-center">
            <span className="text-gray-900 font-bold">Tổng (đơn này)</span>
            <span className="text-green-700 font-bold text-lg">
              {order.totalAmount.toLocaleString("vi-VN")}₫
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  /**
   * Component con để render các món MỚI (từ useCart)
   */
  const NewItemsList: React.FC = () => (
    <div className="space-y-4">
      {cartItems.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl shadow-sm border-2 border-amber-200 p-4"
        >
          <div className="flex gap-4">
            <img
              src={
                item.image || // Giả sử useCart lưu 'image', nếu không hãy dùng item.imageUrl
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"
              }
              alt={item.name}
              className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
                  {item.name}
                </h3>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 active:scale-95 rounded-lg"
                  title="Xóa món"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-amber-600 font-bold text-xl">
                  {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                </span>
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1.5">
                  <button
                    onClick={() => handleDecrease(item.id)}
                    className="w-9 h-9 rounded-full bg-white text-gray-700 hover:bg-gray-200 active:scale-90 shadow-sm font-bold text-lg"
                  >
                    −
                  </button>
                  <span className="font-bold text-gray-900 text-lg min-w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleIncrease(item.id)}
                    className="w-9 h-9 rounded-full bg-amber-500 text-white hover:bg-amber-600 active:scale-90 shadow-sm font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  /**
   * Component con để render các nút bấm
   */
  const ActionButtons: React.FC = () => {
    // CASE 1: Bàn trống
    if (activeOrders.length === 0) {
      return (
        <Button
          onClick={handleCreateNewOrder}
          disabled={isSubmitting}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg py-6 rounded-xl shadow-lg"
        >
          {isSubmitting ? "Đang gửi..." : "✓ Xác nhận đơn hàng"}
        </Button>
      );
    }

    // CASE 2: Bàn đã có order (Logic tách bill)
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-center">
          Bạn muốn thêm {cartItems.length} món này vào đâu?
        </h3>
        {/* Lặp qua các order đang có */}
        {activeOrders.map((order) => (
          <Button
            key={order.id}
            onClick={() => handleAddToExistingOrder(order.id)}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-6 rounded-xl shadow-lg"
          >
            {isSubmitting
              ? "Đang thêm..."
              : `Thêm vào Đơn hàng #${order.orderNumber} (của ${
                  order.customerName ||
                  (order.customerUserId
                    ? `Khách ${order.customerUserId}`
                    : "...")
                })`}
          </Button>
        ))}

        {/* Luôn có lựa chọn "Tạo hóa đơn mới" */}
        <Button
          onClick={handleCreateNewOrder}
          disabled={isSubmitting}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg py-6 rounded-xl shadow-lg"
        >
          {isSubmitting ? "Đang tạo..." : "HOẶC Tạo đơn MỚI cho riêng tôi"}
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/menu-order?tableId=${tableId}`)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              Giỏ hàng (Bàn {tableId})
            </h1>
            <div className="w-10"></div> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-40">
        {/* Hiển thị Loading hoặc Error hoặc "Giỏ hàng trống" */}
        {renderLoadingOrError()}

        {/* Chỉ render nội dung nếu: không loading, không lỗi, và có hàng */}
        {!loading && !error && cartItems.length > 0 && (
          <>
            {/* PHẦN 1: CÁC MÓN ĐÃ CÓ (TỪ API) */}
            {activeOrders.length > 0 && (
              <>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Món đã có tại bàn
                </h2>
                <ConfirmedItemsList orders={activeOrders} />
                <div className="h-px bg-gray-300 my-8 border-dashed"></div>
              </>
            )}

            {/* PHẦN 2: CÁC MÓN MỚI (TỪ useCart) */}
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Món đang chờ thêm
            </h2>
            <NewItemsList />
          </>
        )}
      </div>

      {/* Fixed Bottom Button */}
      {/* Chỉ hiển thị nút bấm nếu: không loading, không lỗi, và CÓ hàng trong giỏ */}
      {!loading && !error && cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-2xl">
          <div className="max-w-4xl mx-auto">
            {/* PHẦN 3: NÚT BẤM (LOGIC CHỌN HÓA ĐƠN) */}
            <ActionButtons />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;