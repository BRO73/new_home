import { Button } from "@/components/ui/button";
import { UtensilsCrossed, User, History, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {getCustomerByPhone, getCustomerByPhoneNumber} from '@/api/customer.api';

const Header = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lấy chữ cái đầu cho avatar
  const getInitials = (name: string) => {
    if (!name) return 'US';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Fetch customer data khi có userPhone
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const phone = localStorage.getItem('userPhone');
        setUserPhone(phone);
        
        if (phone) {
          const customerData = await getCustomerByPhone(phone);
          setCustomer(customerData);
          
          // Lưu customer vào localStorage để sử dụng lại
          localStorage.setItem(`customer_${phone}`, JSON.stringify(customerData));
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();

    // Listen for storage changes
    const handleStorageChange = () => {
      fetchCustomerData();
    };

    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Gọi hàm logout từ useAuth để xoá cả accessToken và userPhone
    logout();
    
    // Clear state
    setUserPhone(null);
    setCustomer(null);
    setShowDropdown(false);
    
    // Chuyển hướng về trang chủ
    navigate("/");
  };

  const handleAvatarClick = () => {
    setShowDropdown(!showDropdown);
  };

  // Lấy tên hiển thị cho avatar
  const getDisplayName = () => {
    if (customer?.fullName) {
      return customer.fullName;
    }
    return userPhone || 'User';
  };

  // Lấy initials cho avatar
  const getAvatarInitials = () => {
    if (customer?.fullName) {
      return getInitials(customer.fullName);
    }
    if (userPhone) {
      return userPhone.slice(-2); // Lấy 2 số cuối của số điện thoại
    }
    return 'US';
  };

  if (loading) {
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
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

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
                  {/* Avatar với style giống Profile - màu xanh cố định */}
                  <Avatar className="w-10 h-10 border-2 border-white shadow-sm bg-[#4c95e1]">
                    <AvatarFallback className="text-black text-sm font-semibold">
                      {getAvatarInitials()}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-12 mt-2 w-64 bg-white rounded-lg shadow-xl border py-2 z-50">
                    {/* Header dropdown */}
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium text-gray-900">Tài khoản của bạn</p>
                      <p className="text-sm text-gray-500">{getDisplayName()}</p>
                    </div>

                    {/* Menu items - History và Profile */}
                    <div className="py-2">
                      <Link 
                        to="/history" 
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <History className="w-4 h-4" />
                        History
                      </Link>
                      <Link 
                        to="/profile" 
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                    </div>

                    {/* Đăng xuất */}
                    <div className="border-t pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-left text-red-600 hover:bg-red-50 transition-colors"
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