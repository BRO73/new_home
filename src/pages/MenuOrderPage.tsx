import React, { FC, useEffect, useState, useMemo } from "react";
// Giả sử FoodDetail được import từ file riêng
import FoodDetail from "./FoodDetail";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { getAllMenuItems } from "@/api/menuItem.api";
import { getTableById } from "@/api/table.api";
import { isAxiosError } from "axios";
import { MenuItem, Table } from "@/types/index";
import {
  IconPayment,
  IconUtensils,
  IconQuestion,
  IconOther,
} from "@/components/Icons";
// (SỬA) Import icon ChevronLeft
import { ChevronLeft } from "lucide-react";

// =====================================================
// STORAGE KEYS HELPER
// =====================================================
const getStorageKeys = (tableId: number) => ({
  activeOrder: `activeOrderId_table_${tableId}`,
  pendingOrder: `pendingOrderId_table_${tableId}`,
});

// =====================================================
// MAIN COMPONENT
// =====================================================
interface MenuProps {
  title?: string;
}

const MenuOrderPage: FC<MenuProps> = ({ title = "Thực Đơn Đặc Biệt" }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // === State ===
  const [tableInfo, setTableInfo] = useState<Table | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState<boolean>(true);
  const [menuError, setMenuError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [callingStaff, setCallingStaff] = useState<boolean>(false);
  const [showCallStaffOptions, setShowCallStaffOptions] =
    useState<boolean>(false);
  const [showCallStaffSuccess, setShowCallStaffSuccess] =
    useState<boolean>(false);
  const [callStaffSuccessMessage, setCallStaffSuccessMessage] =
    useState<string>("");

  const { addToCart, getTotalItems } = useCart();

  // =====================================================
  // 1. LƯU TARGET ORDER ID TỪ NAVIGATION STATE
  // =====================================================
  useEffect(() => {
    const targetOrderId = location.state?.targetOrderId;

    if (targetOrderId) {
      const params = new URLSearchParams(location.search);
      const tableIdFromUrl = params.get("tableId");

      if (tableIdFromUrl) {
        const tableId = Number(tableIdFromUrl);
        const storageKeys = getStorageKeys(tableId);

        sessionStorage.setItem(
          storageKeys.pendingOrder,
          targetOrderId.toString()
        );
        console.log(`🎯 MenuOrderPage: Set pendingOrderId = ${targetOrderId}`);
      }
    }
  }, [location.state, location.search]);

  // =====================================================
  // 2. LOAD TABLE INFO
  // =====================================================
  useEffect(() => {
    const loadTableInfo = async (tableId: number) => {
      try {
        setLoading(true);
        setError(null);

        const table = await getTableById(tableId);

        if (table.status !== "available" && table.status !== "occupied") {
          setError(
            `Bàn này đang ở trạng thái "${table.status}" và không thể nhận order.`
          );
          setLoading(false);
          return;
        }

        setTableInfo(table);
      } catch (err) {
        console.error("Error loading table:", err);
        if (isAxiosError(err) && err.response) {
          const status = err.response.status;
          if (status === 404) {
            setError("Bàn không tồn tại hoặc mã QR đã hết hạn.");
          } else if (status === 409) {
            setError("Bàn đã bị khóa hoặc không khả dụng.");
          } else {
            setError("Không thể tải thông tin bàn.");
          }
        } else {
          setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
        }
        setTableInfo(null);
      } finally {
        setLoading(false);
      }
    };

    const params = new URLSearchParams(location.search);
    const tableIdFromUrl = params.get("tableId");

    if (tableIdFromUrl) {
      loadTableInfo(Number(tableIdFromUrl));
    } else {
      setError("Không tìm thấy ID bàn trong URL.");
      setLoading(false);
    }
  }, [location.search]);

  // =====================================================
  // 3. LOAD MENU ITEMS
  // =====================================================
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setMenuLoading(true);
        setMenuError(null);
        const data = await getAllMenuItems();
        setMenuItems(data);
      } catch (err) {
        setMenuError("Không thể tải dữ liệu menu.");
        console.error("Error fetching menu items:", err);
      } finally {
        setMenuLoading(false);
      }
    };
    fetchMenuItems();
  }, []);

  // =====================================================
  // 4. COMPUTED VALUES
  // =====================================================
  const cartItemCount = useMemo(() => getTotalItems(), [getTotalItems]);

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(menuItems.map((item) => item.category)),
    ].filter(Boolean);
    return ["Tất cả", ...uniqueCategories];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "Tất cả" || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchTerm]);

  // =====================================================
  // 5. HANDLERS
  // =====================================================
  const handleBackToLiveOrder = () => {
    if (!tableInfo) return;
    navigate(`/live-order?tableId=${tableInfo.id}`);
  };

  const handleQuickAddToCart = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.status.toLowerCase() !== "available") return;

    setAddingToCart(item.id);
    addToCart(
      {
        id: item.id, // Đảm bảo ID là number (đã sửa ở types/index.ts)
        name: item.name,
        price: item.price,
        imageUrl:
          item.imageUrl ||
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
        description: item.description,
        // Các trường khác của MenuItemOrder nếu có
        image:
          item.imageUrl ||
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
        rating: 4.5, // Giả sử
        category: item.category,
      },
      1
    );

    setTimeout(() => setAddingToCart(null), 600);
  };

  const handleOrderClick = (item: MenuItem) => {
    if (item.status.toLowerCase() !== "available") return;
    setSelectedItem(item);
  };

  const callOptions = [
    { title: "Thanh toán", icon: <IconPayment /> },
    { title: "Thêm chén bát, dao nĩa", icon: <IconUtensils /> },
    { title: "Thắc mắc về món", icon: <IconQuestion /> },
    { title: "Khác", icon: <IconOther /> },
  ];

  const handleCallStaff = () => setShowCallStaffOptions(true);

  const handleSelectCallOption = (reason: string) => {
    setShowCallStaffOptions(false);
    setCallingStaff(true);

    const message = `Yêu cầu (${reason}) đã được gửi. Nhân viên sẽ đến bàn ${
      tableInfo?.tableNumber || "N/A"
    } - ${tableInfo?.section || "..."} ngay.`;
    setCallStaffSuccessMessage(message);

    setTimeout(() => setShowCallStaffSuccess(true), 1000);
  };

  const closeSuccessModal = () => {
    setShowCallStaffSuccess(false);
    setCallingStaff(false);
  };

  // =====================================================
  // 6. LOADING & ERROR STATES
  // =====================================================
  const isLoadingAny = loading || menuLoading;
  const errorAny = error || menuError;
  const loadingMessage = loading
    ? "Đang xác thực thông tin bàn..."
    : "Đang tải thực đơn...";

  if (isLoadingAny || errorAny) {
    return (
      <PageStatus
        loading={isLoadingAny}
        error={errorAny}
        loadingMessage={loadingMessage}
      />
    );
  }

  // =====================================================
  // 7. RENDER
  // =====================================================
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <MenuHeader
        tableInfo={tableInfo}
        callingStaff={callingStaff}
        onCallStaff={handleCallStaff}
        cartItemCount={cartItemCount}
        onBackToLiveOrder={handleBackToLiveOrder}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectedCategoryChange={setSelectedCategory}
      />

      <div className="px-4 pt-4">
        <div className="relative w-full h-40 sm:h-48 rounded-2xl overflow-hidden shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80&auto=format&fit=crop"
            alt="Hero Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center p-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 shadow-sm">
              {title}
            </h2>
            <p className="text-sm sm:text-base shadow-sm">
              Món ngon đang chờ bạn khám phá
            </p>
          </div>
        </div>
      </div>

      <MenuList
        items={filteredItems}
        addingToCart={addingToCart}
        onOrderClick={handleOrderClick}
        onQuickAddToCart={handleQuickAddToCart}
      />

      <CallStaffModals
        showOptions={showCallStaffOptions}
        onCloseOptions={() => setShowCallStaffOptions(false)}
        callOptions={callOptions}
        onSelectOption={handleSelectCallOption}
        showSuccess={showCallStaffSuccess}
        onCloseSuccess={closeSuccessModal}
        successMessage={callStaffSuccessMessage}
      />

      <FoodDetail item={selectedItem} onClose={() => setSelectedItem(null)} />

      {cartItemCount > 0 && (
        <CartFooter
          cartItemCount={cartItemCount}
          onBackToLiveOrder={handleBackToLiveOrder}
        />
      )}
    </div>
  );
};

export default MenuOrderPage;

// =====================================================
// SUB COMPONENTS
// =====================================================
interface PageStatusProps {
  loading: boolean;
  error: string | null;
  loadingMessage: string;
}

const PageStatus: FC<PageStatusProps> = ({
  loading,
  error,
  loadingMessage,
}) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          {/* (SỬA MÀU) */}
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Có lỗi xảy ra
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            // (SỬA MÀU)
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  return null;
};

interface MenuHeaderProps {
  tableInfo: Table | null;
  callingStaff: boolean;
  onCallStaff: () => void;
  cartItemCount: number;
  onBackToLiveOrder: () => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  categories: string[];
  selectedCategory: string;
  onSelectedCategoryChange: (category: string) => void;
}

const MenuHeader: FC<MenuHeaderProps> = ({
  tableInfo,
  callingStaff,
  onCallStaff,
  cartItemCount,
  onBackToLiveOrder,
  searchTerm,
  onSearchTermChange,
  categories,
  selectedCategory,
  onSelectedCategoryChange,
}) => {
  return (
    <div className="bg-white sticky top-0 z-30 shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          {/* (SỬA) THÊM NÚT BACK + SỬA MÀU */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* NÚT BACK MỚI (LUÔN HIỂN THỊ) */}
            <button
              className="h-10 w-10 -ml-2 flex items-center justify-center hover:bg-gray-100 rounded-lg"
              onClick={onBackToLiveOrder}
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>

            {/* Thông tin bàn */}
            <div
              className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              onClick={onBackToLiveOrder} // Bấm vào số bàn cũng quay về
            >
              {tableInfo?.tableNumber || "--"}
            </div>
            <div className="min-w-0" onClick={onBackToLiveOrder}>
              <div className="text-xs font-bold text-gray-900 truncate">
                Bàn {tableInfo?.tableNumber || "N/A"}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {tableInfo?.section || "..."}
              </div>
            </div>
          </div>

          {/* Nút Gọi NV & Giỏ hàng */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onCallStaff}
              disabled={callingStaff}
              className={`px-3 py-2 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 ${
                callingStaff
                  ? "bg-green-500 text-white" // Giữ màu xanh lá khi đã gọi
                  : "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
              }`}
            >
              {/* ... svg ... (giữ nguyên) */}
              {callingStaff ? (
                <>
                  <svg
                    className="w-3.5 h-3.5 animate-bounce"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Đã gọi
                </>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  Gọi NV
                </>
              )}
            </button>

            {/* Nút giỏ hàng (chỉ hiện khi có đồ) */}
            {cartItemCount > 0 && (
              <button
                onClick={onBackToLiveOrder}
                className="relative p-2 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition-all flex-shrink-0"
              >
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {/* (SỬA MÀU) Badge đổi thành màu đỏ */}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Tìm món ăn..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            // (SỬA MÀU)
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Category tabs */}
      <div className="px-4 pb-2 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onSelectedCategoryChange(category)}
              // (SỬA MÀU)
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface MenuListProps {
  items: MenuItem[];
  addingToCart: number | null;
  onOrderClick: (item: MenuItem) => void;
  onQuickAddToCart: (item: MenuItem, e: React.MouseEvent) => void;
}

const MenuList: FC<MenuListProps> = ({
  items,
  addingToCart,
  onOrderClick,
  onQuickAddToCart,
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Không tìm thấy món ăn
        </h3>
        <p className="text-gray-500 text-sm">Thử tìm kiếm với từ khóa khác</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onOrderClick(item)}
            className="bg-white rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform cursor-pointer"
          >
            <div className="relative aspect-square">
              <img
                src={
                  item.imageUrl ||
                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"
                }
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                <svg
                  className="w-3 h-3 text-yellow-400 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <span className="font-medium text-xs">4.8</span>
              </div>
              {item.status.toLowerCase() !== "available" && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">
                    Hết hàng
                  </span>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2 min-h-[40px]">
                {item.name}
              </h3>
              <div className="flex items-center justify-between">
                {/* (SỬA MÀU) Giá tiền */}
                <div className="text-gray-900 font-bold text-base">
                  {item.price.toLocaleString("vi-VN")}₫
                </div>
                {item.status.toLowerCase() === "available" && (
                  <button
                    onClick={(e) => onQuickAddToCart(item, e)}
                    // (SỬA MÀU) Nút Add
                    className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
                      addingToCart === item.id
                        ? "bg-green-500 scale-110 text-white" // Giữ màu xanh lá khi add
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {addingToCart === item.id ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface CallStaffModalsProps {
  showOptions: boolean;
  onCloseOptions: () => void;
  callOptions: { title: string; icon: React.ReactNode }[];
  onSelectOption: (reason: string) => void;
  showSuccess: boolean;
  onCloseSuccess: () => void;
  successMessage: string;
}

const CallStaffModals: FC<CallStaffModalsProps> = ({
  showOptions,
  onCloseOptions,
  callOptions,
  onSelectOption,
  showSuccess,
  onCloseSuccess,
  successMessage,
}) => {
  return (
    <>
      {showOptions && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
          onClick={onCloseOptions}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 text-center mb-5">
              Bạn cần hỗ trợ gì?
            </h2>
            <div className="space-y-3 mb-6">
              {callOptions.map((option) => (
                <button
                  key={option.title}
                  onClick={() => onSelectOption(option.title)}
                  className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-lg text-gray-800 font-semibold text-left hover:bg-gray-100 transition-colors"
                >
                  {option.icon}
                  <span>{option.title}</span>
                </button>
              ))}
            </div>
            <button
              onClick={onCloseOptions}
              className="w-full bg-white text-gray-800 font-semibold py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
      {showSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
          onClick={onCloseSuccess}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm text-center p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* (SỬA MÀU) Icon Modal */}
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-10 h-10 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-5">
              Đã gửi yêu cầu
            </h2>
            <p className="text-gray-600 mt-2 text-sm">{successMessage}</p>
            <button
              onClick={onCloseSuccess}
              // (SỬA MÀU) Nút OK
              className="w-full bg-blue-500 text-white font-semibold py-3 rounded-lg mt-6 hover:bg-blue-600 transition-colors active:scale-95"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

interface CartFooterProps {
  cartItemCount: number;
  onBackToLiveOrder: () => void;
}

// (HOÀN THIỆN) Code cho CartFooter
const CartFooter: FC<CartFooterProps> = ({
  cartItemCount,
  onBackToLiveOrder,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100">
      <button
        onClick={onBackToLiveOrder}
        // (SỬA MÀU)
        className="w-full flex justify-between items-center bg-blue-500 text-white font-bold py-3.5 px-5 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all active:scale-95"
      >
        <span>{cartItemCount} món trong giỏ</span>
        <span className="flex items-center gap-2">
          Quay lại order
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
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </span>
      </button>
    </div>
  );
};
