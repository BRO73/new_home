import { Button } from "@/components/ui/button";
import { UtensilsCrossed, User, Gift, LogOut, Award } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userRewards, setUserRewards] = useState<any[]>([]);
  const [hasNewReward, setHasNewReward] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check for user phone on component mount and storage changes
  useEffect(() => {
    const checkUserPhone = () => {
      const phone = localStorage.getItem("userPhone");
      setUserPhone(phone);
      
      // Kiểm tra phần thưởng của user
      if (phone) {
        const rewardsKey = `rewards_${phone}`;
        const rewards = JSON.parse(localStorage.getItem(rewardsKey) || '[]');
        setUserRewards(rewards);
        
        // Kiểm tra có phần thưởng mới không
        const hasNew = localStorage.getItem('hasNewReward') === 'true';
        setHasNewReward(hasNew);
      }
    };

    // Check initially
    checkUserPhone();

    // Listen for storage changes
    const handleStorageChange = () => {
      checkUserPhone();
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        if (hasNewReward) {
          localStorage.removeItem('hasNewReward');
          setHasNewReward(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [hasNewReward]);

  const handleLogout = () => {
    // Gọi hàm logout từ useAuth để xoá cả accessToken và userPhone
    logout();
    
    // Xoá các thông tin khác
    localStorage.removeItem('hasNewReward');
    
    // Clear state
    setUserPhone(null);
    setShowDropdown(false);
    
    // Chuyển hướng về trang chủ
    navigate("/");
  };

  const handleAvatarClick = () => {
    setShowDropdown(!showDropdown);
    if (hasNewReward) {
      localStorage.removeItem('hasNewReward');
      setHasNewReward(false);
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'voucher_10':
      case 'voucher_15':
      case 'voucher_20':
        return '🎫';
      case 'sticker':
        return '🏷️';
      case 'toy':
        return '🧸';
      case 'mystery':
        return '🎁';
      default:
        return '⭐';
    }
  };

  const getRewardLabel = (type: string) => {
    const labels: any = {
      voucher_10: 'Voucher 10%',
      voucher_15: 'Voucher 15%',
      voucher_20: 'Voucher 20%',
      sticker: 'Sticker',
      toy: 'Gấu bông',
      mystery: 'Quà bí mật'
    };
    return labels[type] || 'Phần thưởng';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-bold">restaurant</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/menu" className="text-sm font-medium hover:text-primary transition-colors">
              Menu
            </Link>
            <Link to="/booking" className="text-sm font-medium hover:text-primary transition-colors">
              Booking
            </Link>
            <Link to="/gallery" className="text-sm font-medium hover:text-primary transition-colors">
              Gallery
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {userPhone ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleAvatarClick}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                >
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  {/* ĐÃ XOÁ HIỂN THỊ SỐ ĐIỆN THOẠI BÊN CẠNH AVATAR */}
                  {/* Badge thông báo phần thưởng mới */}
                  {hasNewReward && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-12 mt-2 w-80 bg-white rounded-lg shadow-xl border py-2 z-50">
                    {/* Header dropdown */}
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium text-gray-900">Tài khoản của bạn</p>
                      <p className="text-sm text-gray-500">{userPhone}</p>
                    </div>

                    {/* Phần thưởng */}
                    <div className="max-h-64 overflow-y-auto">
                      {userRewards.length > 0 ? (
                        <>
                          <div className="px-4 py-2 bg-gray-50">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Phần thưởng của bạn ({userRewards.length})
                            </p>
                          </div>
                          {userRewards.slice().reverse().map((reward) => (
                            <div
                              key={reward.id}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                            >
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                                style={{ backgroundColor: reward.color }}
                              >
                                {getRewardIcon(reward.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {getRewardLabel(reward.type)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(reward.date).toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                              {!reward.claimed && (
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                  Mới
                                </span>
                              )}
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <Award className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Chào mừng bạn đến với nhà hàng!</p>
                          <p className="text-xs text-gray-400 mt-1">Tham gia minigame để nhận quà hấp dẫn!</p>
                        </div>
                      )}
                    </div>

                    {/* Đăng xuất */}
                    <div className="border-t pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-3 text-sm text-left text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button asChild size="lg" className="rounded-full">
                <Link to="/otp-login">LOGIN</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;