import React from "react";
import { useNavigate } from "react-router-dom"; // Thêm import
import { IconPayment, IconUtensils, IconQuestion, IconOther } from "@/components/Icons";

interface CallStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (reason: string) => void;
  tableInfo?: { tableNumber?: string; section?: string };
}

const callOptions = [
  { title: "Thanh toán", icon: <IconPayment /> },
  { title: "Thêm chén bát, dao nĩa", icon: <IconUtensils /> },
  { title: "Thắc mắc về món", icon: <IconQuestion /> },
  { title: "Feedback", icon: <IconOther /> },
];

export const CallStaffModal: React.FC<CallStaffModalProps> = ({
  isOpen,
  onClose,
  onSelectOption,
  tableInfo,
}) => {
  const navigate = useNavigate(); // Thêm hook

  if (!isOpen) return null;

  const handleOptionClick = (title: string) => {
    if (title === "Feedback") {
      navigate('/feedback'); // Chuyển hướng đến trang feedback
      onClose(); // Đóng modal
    } else {
      onSelectOption(title);
      // Không đóng modal ở đây để giữ nguyên hành vi cũ
      // Modal sẽ được đóng bởi logic trong onSelectOption của component cha
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
      onClick={onClose}
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
              onClick={() => handleOptionClick(option.title)} // Sử dụng hàm xử lý mới
              className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-lg text-gray-800 font-semibold text-left hover:bg-gray-100 transition-colors"
            >
              {option.icon}
              <span>{option.title}</span>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full bg-white text-gray-800 font-semibold py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          Hủy
        </button>
      </div>
    </div>
  );
};
