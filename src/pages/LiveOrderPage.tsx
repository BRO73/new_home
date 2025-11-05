import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { createPaymentLink } from "@/api/payment.api";
import {
  getActiveOrdersByTable,
  createOrder,
  addItemsToOrder,
} from "@/api/order.api";
import {
  ChevronLeft,
  MoreVertical,
  Plus,
  FileText,
  AlertCircle,
  X,
  MoreHorizontal,
  CreditCard,
} from "lucide-react";
import {
  OrderResponse,
  CreateOrderRequest,
  OrderDetailRequest,
} from "@/types/index";

// =====================================================
// TYPES
// =====================================================
type LocalCartItem = {
  menuItemId: number;
  quantity: number;
  name: string;
  price: number;
};

type LocalCartsState = Record<number, LocalCartItem[]>;

// =====================================================
// STORAGE KEYS HELPERS
// =====================================================
const getStorageKeys = (tableId: number) => ({
  activeOrder: `activeOrderId_table_${tableId}`,
  pendingOrder: `pendingOrderId_table_${tableId}`,
});

// =====================================================
// MAIN COMPONENT
// =====================================================
const LiveOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // === URL Params ===
  const params = new URLSearchParams(location.search);
  const tableIdFromUrl = params.get("tableId");
  const tableId = tableIdFromUrl ? Number(tableIdFromUrl) : null;
  const storageKeys = tableId ? getStorageKeys(tableId) : null;

  // === Cart Hook (chỉ dùng để nhận món từ MenuOrderPage) ===
  const { cartItems, clearCart } = useCart();

  // === State ===
  const [tableIdState, setTableIdState] = useState<number | null>(tableId);
  const [tableName, setTableName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] =
    useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [localCarts, setLocalCarts] = useState<LocalCartsState>({});

  // ✅ Ref để track xem đã xử lý cart chưa
  const hasProcessedCartRef = useRef(false);

  // =====================================================
  // 1. LOAD ORDERS (Initial Load)
  // =====================================================
  useEffect(() => {
    if (!tableId || !storageKeys) {
      setError("Không tìm thấy tableId trên URL.");
      setLoading(false);
      return;
    }

    setTableIdState(tableId);
    setTableName(`Bàn ${tableId}`);
    loadOrders(tableId);
  }, [location.search, tableId]);

  const loadOrders = async (id: number) => {
    if (!storageKeys) return;

    try {
      setLoading(true);
      setError(null);

      let loadedOrders = await getActiveOrdersByTable(id);

      // Tạo order mới nếu chưa có
      if (loadedOrders.length === 0) {
        console.log("Không tìm thấy order, tạo order mới...");
        const newOrder = await createOrder({ tableId: id, items: [] });
        loadedOrders = [newOrder];
      }

      setOrders(loadedOrders);

      // ✅ LOGIC CHỌN ACTIVE ORDER
      // Ưu tiên: pendingOrderId > savedActiveId > order đầu tiên
      const pendingOrderId = sessionStorage.getItem(storageKeys.pendingOrder);
      const savedActiveId = sessionStorage.getItem(storageKeys.activeOrder);

      let targetOrderId: number | null = null;

      // Check pending order (từ MenuOrderPage quay lại)
      if (pendingOrderId) {
        const pendingId = parseInt(pendingOrderId, 10);
        if (loadedOrders.some((o) => o.id === pendingId)) {
          targetOrderId = pendingId;
          console.log(`✅ Sử dụng pendingOrderId: ${pendingId}`);
        }
        // Clear pending flag
        sessionStorage.removeItem(storageKeys.pendingOrder);
      }

      // Fallback to saved active order
      if (!targetOrderId && savedActiveId) {
        const savedId = parseInt(savedActiveId, 10);
        if (loadedOrders.some((o) => o.id === savedId)) {
          targetOrderId = savedId;
          console.log(`✅ Sử dụng savedActiveId: ${savedId}`);
        }
      }

      // Final fallback: first order
      if (!targetOrderId) {
        targetOrderId = loadedOrders[0].id;
        console.log(`✅ Fallback to first order: ${targetOrderId}`);
      }

      setActiveOrderId(targetOrderId);
    } catch (err) {
      console.error("Lỗi khi tải active orders:", err);
      setError("Không thể tải thông tin order của bàn.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // 2. LƯU ACTIVE ORDER ID VÀO SESSION STORAGE
  // =====================================================
  useEffect(() => {
    if (activeOrderId && storageKeys) {
      sessionStorage.setItem(storageKeys.activeOrder, activeOrderId.toString());
      console.log(`💾 Saved activeOrderId: ${activeOrderId}`);
    }
  }, [activeOrderId, storageKeys]);

  // =====================================================
  // 3. HANDOFF TỪ MENU PAGE (Transfer global cart → local cart)
  // =====================================================
  useEffect(() => {
    // ✅ CRITICAL FIX: Kiểm tra tất cả điều kiện cần thiết
    if (
      cartItems.length === 0 ||
      !storageKeys ||
      !activeOrderId ||
      orders.length === 0 ||
      hasProcessedCartRef.current // Đã xử lý rồi thì skip
    ) {
      return;
    }

    console.log("🔄 Phát hiện global cart, đang chuyển vào local cart...");
    console.log("📦 Cart items:", cartItems);
    console.log("🎯 Active Order ID:", activeOrderId);

    // ✅ ĐỌC PENDING ORDER ID (được set từ MenuOrderPage)
    const pendingOrderId = sessionStorage.getItem(storageKeys.pendingOrder);
    const targetOrderId = pendingOrderId
      ? parseInt(pendingOrderId, 10)
      : activeOrderId;

    console.log("🎯 Target Order ID:", targetOrderId);

    // Verify order tồn tại
    const targetOrderExists = orders.some((o) => o.id === targetOrderId);
    if (!targetOrderExists) {
      console.error(`❌ Order ${targetOrderId} không tồn tại trong danh sách`);
      console.log(
        "📋 Available orders:",
        orders.map((o) => o.id)
      );
      clearCart();
      return;
    }

    console.log(`✅ Transfer cart vào Order: ${targetOrderId}`);

    // Transfer items
    setLocalCarts((prevLocalCarts) => {
      const newLocalCarts = { ...prevLocalCarts };
      const currentCart = newLocalCarts[targetOrderId] || [];

      for (const item of cartItems) {
        const existingItem = currentCart.find(
          (i) => i.menuItemId === Number(item.id)
        );
        if (existingItem) {
          existingItem.quantity += item.quantity;
          console.log(
            `➕ Tăng số lượng ${item.name}: ${existingItem.quantity}`
          );
        } else {
          currentCart.push({
            menuItemId: Number(item.id),
            quantity: item.quantity,
            name: item.name,
            price: item.price,
          });
          console.log(`🆕 Thêm mới ${item.name}: ${item.quantity}`);
        }
      }

      newLocalCarts[targetOrderId] = currentCart;
      console.log(`✅ Local cart updated:`, newLocalCarts[targetOrderId]);
      return newLocalCarts;
    });

    // Đảm bảo UI focus vào đúng order
    if (targetOrderId !== activeOrderId) {
      console.log(
        `🔄 Switch active order từ ${activeOrderId} → ${targetOrderId}`
      );
      setActiveOrderId(targetOrderId);
    }

    // Mark as processed
    hasProcessedCartRef.current = true;

    // Clear cart
    clearCart();
    console.log("🧹 Cleared global cart");

    // Reset flag sau 1s để cho phép xử lý lần sau
    setTimeout(() => {
      hasProcessedCartRef.current = false;
    }, 1000);
  }, [cartItems, activeOrderId, orders, storageKeys, clearCart]);

  // =====================================================
  // 4. TẠO ORDER MỚI
  // =====================================================
  const handleCreateOrder = async () => {
    if (!tableId) return;

    try {
      const newOrder = await createOrder({ tableId, items: [] });
      setOrders([...orders, newOrder]);
      setActiveOrderId(newOrder.id);
    } catch (err) {
      console.error("Lỗi khi tạo order mới:", err);
      setError("Không thể tạo thêm order.");
      setShowError(true);
    }
  };

  // =====================================================
  // 5. GỬI THÔNG BÁO (Submit new items to server)
  // =====================================================
  const handleSubmitNewItems = async () => {
    if (!tableId || !activeOrderId || isSubmitting) return;

    const itemsToSubmit = localCarts[activeOrderId] || [];
    if (itemsToSubmit.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    const apiItems: OrderDetailRequest[] = itemsToSubmit.map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      specialRequirements: "",
    }));

    try {
      await addItemsToOrder(activeOrderId, apiItems);

      // Clear local cart cho order này
      setLocalCarts((prev) => ({
        ...prev,
        [activeOrderId]: [],
      }));

      // Reload orders
      await loadOrders(tableId);
    } catch (err) {
      console.error("Lỗi khi gửi đơn hàng:", err);
      setError("Không thể gửi đơn hàng. Vui lòng thử lại.");
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // 6. XỬ LÝ THANH TOÁN
  // =====================================================
  const handleRequestPayment = async () => {
    console.log("🔔 handleRequestPayment called");
    console.log("Active Order ID:", activeOrderId);
    console.log("Local Cart:", localCarts[activeOrderId]);

    if (!activeOrderId) {
      setError("Vui lòng chọn order để thanh toán.");
      setShowError(true);
      return;
    }

    // Kiểm tra nếu còn món chưa gửi thông báo
    const currentLocalCart = localCarts[activeOrderId] || [];
    if (currentLocalCart.length > 0) {
      console.log("❌ Còn món chưa gửi thông báo:", currentLocalCart.length);
      setError("Vui lòng gửi thông báo món ăn trước khi thanh toán.");
      setShowError(true);
      return;
    }

    console.log("✅ Hiển thị modal thanh toán");
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!activeOrderId) return;

    setIsProcessingPayment(true);
    setError(null);

    try {
      // Tạo return và cancel URLs
      const currentUrl = window.location.origin;
      const returnUrl = `${currentUrl}/payment-success?orderId=${activeOrderId}&tableId=${tableId}`;
      const cancelUrl = `${currentUrl}/live-order?tableId=${tableId}`;

      // Gọi API tạo payment link
      const paymentResponse = await createPaymentLink({
        orderId: activeOrderId,
        returnUrl: returnUrl,
        cancelUrl: cancelUrl,
      });

      // Redirect đến trang thanh toán
      if (paymentResponse.checkoutUrl) {
        window.location.href = paymentResponse.checkoutUrl;
      } else {
        throw new Error("Không nhận được link thanh toán");
      }
    } catch (err) {
      console.error("Lỗi khi tạo payment link:", err);
      setError("Không thể tạo link thanh toán. Vui lòng thử lại.");
      setShowError(true);
    } finally {
      setIsProcessingPayment(false);
      setShowPaymentModal(false);
    }
  };

  // =====================================================
  // 7. DISPLAY ITEMS (Gộp DB + Local)
  // =====================================================
  const displayItems = useMemo(() => {
    if (!activeOrderId) return [];

    const activeOrder = orders.find((o) => o.id === activeOrderId);
    const dbItems = activeOrder ? activeOrder.items : [];
    const localItems = localCarts[activeOrderId] || [];

    type DisplayItem = {
      menuItemId: number;
      name: string;
      price: number;
      dbQty: number;
      localQty: number;
    };

    const itemMap = new Map<number, DisplayItem>();

    // Add DB items
    for (const item of dbItems) {
      itemMap.set(item.menuItem.id, {
        menuItemId: item.menuItem.id,
        name: item.menuItem.name,
        price: item.price,
        dbQty: item.quantity,
        localQty: 0,
      });
    }

    // Add local items
    for (const item of localItems) {
      const existing = itemMap.get(item.menuItemId);
      if (existing) {
        existing.localQty += item.quantity;
      } else {
        itemMap.set(item.menuItemId, {
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          dbQty: 0,
          localQty: item.quantity,
        });
      }
    }

    return Array.from(itemMap.values());
  }, [activeOrderId, orders, localCarts]);

  // =====================================================
  // 8. QUANTITY CHANGE HANDLER
  // =====================================================
  const handleQuantityChange = (menuItemId: number, totalQuantity: number) => {
    if (!activeOrderId) return;

    const displayItem = displayItems.find((i) => i.menuItemId === menuItemId);
    if (!displayItem) return;

    const dbQty = displayItem.dbQty;
    const newLocalQty = totalQuantity - dbQty;

    setLocalCarts((prevLocalCarts) => {
      const newLocalCarts = { ...prevLocalCarts };
      let currentCart = newLocalCarts[activeOrderId] || [];

      if (newLocalQty <= 0) {
        // Remove item from local cart
        currentCart = currentCart.filter((i) => i.menuItemId !== menuItemId);
      } else {
        // Update or add item
        const existingItem = currentCart.find(
          (i) => i.menuItemId === menuItemId
        );
        if (existingItem) {
          existingItem.quantity = newLocalQty;
        } else {
          currentCart.push({
            menuItemId: menuItemId,
            quantity: newLocalQty,
            name: displayItem.name,
            price: displayItem.price,
          });
        }
      }

      newLocalCarts[activeOrderId] = currentCart;
      return newLocalCarts;
    });
  };

  // =====================================================
  // 9. CALCULATIONS
  // =====================================================
  const currentLocalCart = localCarts[activeOrderId] || [];

  const newItemsTotal =
    currentLocalCart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ) / 100; // Chia 100 để test

  const confirmedTotal = useMemo(() => {
    return (
      displayItems.reduce((sum, item) => sum + item.price * item.dbQty, 0) / 100
    ); // Chia 100 để test
  }, [displayItems]);

  const grandTotal = confirmedTotal + newItemsTotal;

  const totalItems = useMemo(() => {
    return displayItems.reduce(
      (sum, item) => sum + item.dbQty + item.localQty,
      0
    );
  }, [displayItems]);

  // =====================================================
  // 10. NAVIGATION TO MENU
  // =====================================================
  const handleNavigateToMenu = () => {
    if (!tableId || !activeOrderId || !storageKeys) return;

    // ✅ LƯU PENDING ORDER ID để MenuOrderPage biết
    sessionStorage.setItem(storageKeys.pendingOrder, activeOrderId.toString());
    console.log(`🎯 Set pendingOrderId: ${activeOrderId}`);

    // Navigate với state
    navigate(`/menu-order?tableId=${tableId}`, {
      state: { targetOrderId: activeOrderId },
    });
  };

  // =====================================================
  // 11. RENDER
  // =====================================================
  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <button
          className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded-lg"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-base font-semibold text-gray-900">
          {loading ? "Đang tải..." : tableName || `Bàn ${tableIdState}`}
        </h1>
        <button className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded-lg">
          <MoreVertical className="h-6 w-6 text-gray-700" />
        </button>
      </header>

      {/* Order Task Bar */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide bg-white flex-shrink-0 border-b border-gray-200">
        {orders.map((order, index) => {
          const pendingCount = (localCarts[order.id] || []).reduce(
            (acc, item) => acc + item.quantity,
            0
          );

          return (
            <button
              key={order.id}
              onClick={() => setActiveOrderId(order.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 flex-shrink-0 transition-all ${
                activeOrderId === order.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <span className="text-sm font-medium">Order {index + 1}</span>
              {pendingCount > 0 && (
                <span className="min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={handleCreateOrder}
          className="w-10 h-10 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center flex-shrink-0"
        >
          <Plus className="h-5 w-5 text-blue-600" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {showError && error && (
          <ErrorBanner message={error} onDismiss={() => setShowError(false)} />
        )}

        {loading && (
          <div className="text-center py-10 text-gray-500 text-sm">
            Đang tải...
          </div>
        )}

        {!loading &&
          displayItems.length > 0 &&
          displayItems.map((item) => {
            const totalQty = item.dbQty + item.localQty;
            const isNewOnly = item.dbQty === 0 && item.localQty > 0;

            return (
              <OrderItemCard
                key={item.menuItemId}
                name={item.name}
                price={item.price}
                quantity={totalQty}
                onQuantityChange={(q) =>
                  handleQuantityChange(item.menuItemId, q)
                }
                isNew={isNewOnly}
                dbQuantity={item.dbQty}
              />
            );
          })}

        {!loading && displayItems.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="mb-2 font-medium text-sm">Chưa có món nào.</p>
            <p className="text-xs">Bấm dấu "+" để thêm món.</p>
          </div>
        )}

        <div className="h-32"></div>
      </div>

      {/* Floating Add Button */}
      <button
        className="fixed bottom-28 right-5 h-12 w-12 rounded-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 shadow-lg z-30 flex items-center justify-center"
        onClick={handleNavigateToMenu}
      >
        <Plus className="h-5 w-5 text-white" />
      </button>

      {/* Bottom Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-900">
            Tổng tiền{" "}
            <span className="ml-1 font-normal text-gray-600">
              {totalItems} món
            </span>
          </span>
          <span className="text-2xl font-bold text-gray-900">
            {grandTotal.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            className="h-11 rounded-lg border-2 border-blue-500 bg-white hover:bg-blue-50 active:bg-blue-100 flex items-center justify-center gap-1.5 text-sm font-medium text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            <FileText className="h-4 w-4" />
            Tạm tính
          </button>

          <button
            className="h-11 rounded-lg border-2 border-blue-500 bg-white hover:bg-blue-50 active:bg-blue-100 text-sm font-medium text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || currentLocalCart.length > 0}
            onClick={handleRequestPayment}
          >
            <CreditCard className="h-4 w-4 inline mr-1" />
            Thanh toán
          </button>

          <button
            className="h-11 rounded-lg bg-blue-100 hover:bg-blue-200 active:bg-blue-300 text-blue-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmitNewItems}
            disabled={
              isSubmitting || !activeOrderId || currentLocalCart.length === 0
            }
          >
            {isSubmitting ? "Đang gửi..." : "Thông báo"}
          </button>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Xác nhận thanh toán
              </h3>
              <p className="text-sm text-gray-600">
                Bạn muốn thanh toán cho Order{" "}
                {orders.findIndex((o) => o.id === activeOrderId) + 1}?
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Tổng tiền</p>
                <p className="text-2xl font-bold text-gray-900">
                  {confirmedTotal.toLocaleString()} đ
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 h-11 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 text-sm font-medium text-gray-700"
                onClick={() => setShowPaymentModal(false)}
                disabled={isProcessingPayment}
              >
                Hủy
              </button>
              <button
                className="flex-1 h-11 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={processPayment}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =====================================================
// SUB COMPONENTS
// =====================================================
const ErrorBanner: React.FC<{
  message: string;
  onDismiss: () => void;
}> = ({ message, onDismiss }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="text-sm text-red-700 font-medium">{message}</p>
    </div>
    <button
      className="h-6 w-6 -mr-1 hover:bg-red-100 rounded flex items-center justify-center"
      onClick={onDismiss}
    >
      <X className="h-4 w-4 text-red-500" />
    </button>
  </div>
);

const OrderItemCard: React.FC<{
  name: string;
  description?: string;
  price: number;
  quantity: number;
  onQuantityChange: (q: number) => void;
  isNew?: boolean;
  dbQuantity: number;
}> = ({
  name,
  description,
  price,
  quantity,
  onQuantityChange,
  isNew,
  dbQuantity,
}) => (
  <div
    className={`bg-white rounded-lg p-4 transition-all ${
      isNew ? "border-2 border-blue-500" : "border border-gray-100"
    }`}
  >
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
        <span className="text-lg">🍽️</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">
            {name}
          </h3>
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {description && (
          <p className="text-xs text-gray-500 mb-2">{description}</p>
        )}

        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-gray-900">
            {price.toLocaleString()}
          </p>

          <div className="flex items-center gap-2">
            <button
              className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 active:bg-gray-100 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onQuantityChange(quantity - 1)}
              disabled={quantity <= dbQuantity}
            >
              −
            </button>

            <span className="text-sm font-semibold w-6 text-center text-gray-900">
              {quantity}
            </span>

            <button
              className="w-7 h-7 rounded border border-blue-500 flex items-center justify-center text-blue-500 hover:bg-blue-50 active:bg-blue-100 text-base font-medium"
              onClick={() => onQuantityChange(quantity + 1)}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default LiveOrderPage;
