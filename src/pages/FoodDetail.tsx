import React, { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { MenuItem } from "@/types/index";

interface FoodDetailProps {
  item: MenuItem | null;
  onClose: () => void;
}

// === COMPONENT CON ĐỂ VẼ ICON ===
const MinusIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5} // Dày hơn cho rõ
      d="M20 12H4"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5} // Dày hơn cho rõ
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const CloseIcon = () => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
// ==================================

const FoodDetail: React.FC<FoodDetailProps> = ({ item, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const { addToCart } = useCart();

  if (!item) return null;

  // --- LOGIC (GIỮ NGUYÊN) ---
  const handleAddToCart = () => {
    const finalDescription = note
      ? `${item.description} (Ghi chú: ${note})`
      : item.description;

    addToCart(
      {
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        description: finalDescription,
      },
      quantity
    );

    onClose();
    setQuantity(1);
    setNote("");
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const totalPrice = item.price * quantity;
  const isAvailable = item.status.toLowerCase() === "available";
  // --- KẾT THÚC LOGIC ---

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* === MODAL CHÍNH (LIGHT THEME - GIỐNG ẢNH 2) === */}
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút Đóng (Giống ảnh 2) */}
        <button
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-5 right-5 z-20 p-2 bg-white/90 rounded-full text-gray-700 hover:bg-gray-100 transition shadow-md backdrop-blur-sm"
        >
          <CloseIcon />
        </button>

        {/* 1. Hero Image & Status (Giống ảnh 2) */}
        <div className="relative flex-shrink-0">
          <img
            src={
              item.imageUrl ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop"
            }
            alt={item.name}
            className="w-full h-64 sm:h-72 object-cover"
          />
          {/* Status Badge (Giống ảnh 2) */}
          <span
            className={`absolute top-5 left-5 inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
              isAvailable
                ? "bg-emerald-500 text-white" // Màu xanh lá cây đẹp hơn
                : "bg-rose-500 text-white" // Màu đỏ hồng
            }`}
          >
            {isAvailable ? "Có sẵn" : "Hết hàng"}
          </span>
        </div>

        {/* 2. Header (Tên, Category & Số lượng) (Giống ảnh 2) */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 flex justify-between items-start border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {item.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1.5 capitalize font-medium">
              {item.category}
            </p>
          </div>

          {/* Bộ chọn số lượng (Giống ảnh 2) */}
          {isAvailable && (
            <div className="flex items-center gap-2 flex-shrink-0 ml-4 bg-gray-100 rounded-full p-1">
              <button
                onClick={decrementQuantity}
                className="w-8 h-8 rounded-full bg-white text-gray-700 flex items-center justify-center hover:bg-gray-200 transition shadow-sm border border-gray-200"
                aria-label="Giảm số lượng"
              >
                <MinusIcon />
              </button>
              <span className="text-lg font-bold text-gray-900 min-w-[28px] text-center">
                {quantity}
              </span>
              <button
                onClick={incrementQuantity}
                className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition shadow-sm"
                aria-label="Tăng số lượng"
              >
                <PlusIcon />
              </button>
            </div>
          )}
        </div>

        {/* 3. Vùng Nội dung (Cuộn được) (Giống ảnh 2) */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Mô tả */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
              Mô tả
            </h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Ghi chú */}
          {isAvailable && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                Ghi chú
              </h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Không cay, ít đường, không hành..."
                className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none text-sm transition"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* 4. Footer (Tổng tiền & Nút Add) (Giống ảnh 2) */}
        <div className="flex-shrink-0 bg-white px-6 py-5 border-t border-gray-100 shadow-inner-top">
          <div className="flex justify-between items-center gap-4">
            {/* Tổng tiền */}
            <div>
              <h3 className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                Tổng cộng
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                {isAvailable
                  ? `${totalPrice.toLocaleString("vi-VN")}₫`
                  : `${item.price.toLocaleString("vi-VN")}₫`}
              </p>
            </div>

            {/* Nút Thêm vào giỏ */}
            <button
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className={`px-8 py-4 rounded-full transition duration-200 font-bold text-base flex items-center justify-center gap-2 shadow-lg flex-shrink-0 ${
                isAvailable
                  ? "bg-gray-900 text-white hover:bg-gray-800 active:scale-95 hover:shadow-xl"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isAvailable ? "Thêm vào giỏ" : "Hết hàng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetail;
