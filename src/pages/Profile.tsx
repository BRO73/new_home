import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, Save, X, CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CustomerResponse, CustomerRequest } from '@/types';
import { getCustomerByPhoneNumber, updateCustomer } from '@/api/customer.api';

const Profile = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

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

  // Lấy thông tin user từ API
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const userPhone = localStorage.getItem('userPhone');
        if (userPhone) {
          const customerData = await getCustomerByPhoneNumber(userPhone);
          setCustomer(customerData);
          
          // Lưu customer vào localStorage để Header có thể sử dụng
          localStorage.setItem(`customer_${userPhone}`, JSON.stringify(customerData));
          
          // Tách fullName thành firstName và lastName
          const nameParts = customerData.fullName.split(' ');
          if (nameParts.length > 1) {
            setFirstName(nameParts[0]);
            setLastName(nameParts.slice(1).join(' '));
          } else {
            setFirstName(customerData.fullName);
            setLastName('');
          }
          
          // Set các giá trị khác
          setEmail(customerData.email || '');
          setPhoneNumber(customerData.phoneNumber || '');
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  // Timer cho thời gian thực
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Xử lý khi bấm nút Edit
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Xử lý khi bấm nút Cancel
  const handleCancel = () => {
    // Khôi phục giá trị ban đầu từ customer
    if (customer) {
      const nameParts = customer.fullName.split(' ');
      if (nameParts.length > 1) {
        setFirstName(nameParts[0]);
        setLastName(nameParts.slice(1).join(' '));
      } else {
        setFirstName(customer.fullName);
        setLastName('');
      }
      setEmail(customer.email || '');
      setPhoneNumber(customer.phoneNumber || '');
    }
    setIsEditing(false);
  };

  // Xử lý khi bấm nút Save
  const handleSave = async () => {
    try {
      if (customer) {
        setSaving(true);
        
        // Tạo fullName từ firstName và lastName
        const fullName = `${firstName} ${lastName}`.trim();
        
        // Tạo đối tượng update data theo CustomerRequest
        const updateData: CustomerRequest = {
          fullName: fullName,
          email: email,
          phone: phoneNumber // Sử dụng trường 'phone' theo interface CustomerRequest
        };

        // Gọi API update customer
        const updatedCustomerResponse = await updateCustomer(customer.id, updateData);
        
        // Cập nhật state và localStorage với dữ liệu mới từ server
        setCustomer(updatedCustomerResponse);
        localStorage.setItem(`customer_${customer.phoneNumber}`, JSON.stringify(updatedCustomerResponse));
        
        // Cập nhật lại firstName và lastName từ fullName mới (phòng trường hợp server xử lý khác)
        const nameParts = updatedCustomerResponse.fullName.split(' ');
        if (nameParts.length > 1) {
          setFirstName(nameParts[0]);
          setLastName(nameParts.slice(1).join(' '));
        } else {
          setFirstName(updatedCustomerResponse.fullName);
          setLastName('');
        }

        // Cập nhật email và phoneNumber từ response
        setEmail(updatedCustomerResponse.email || '');
        setPhoneNumber(updatedCustomerResponse.phoneNumber || '');
        
        setIsEditing(false);
        
        // Hiển thị popup thành công
        setShowSuccessPopup(true);
        
        // Tự động ẩn popup sau 3 giây
        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  // Định dạng ngày tháng
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Định dạng thời gian
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background mt-16 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background mt-16">
      <main className="ml-16 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Welcome, {firstName}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDate(currentTime)} • {formatTime(currentTime)}
              </p>
            </div>
            <div className="flex items-center gap-6"></div>
          </header>

          {/* Profile Banner */}
          <div className="bg-card rounded-2xl overflow-hidden shadow-sm mb-8">
            <div className="h-32 bg-[#c5def4]" />
            
            <div className="px-8 pb-6">
              <div className="flex items-start justify-between -mt-16">
                <div className="flex items-center gap-4">
                  {/* Avatar với màu xanh cố định #4c95e1 và chữ màu đen */}
                  <Avatar 
                    className="w-28 h-28 border-4 border-card shadow-lg bg-[#4c95e1]" 
                  >
                    <AvatarFallback className="text-2xl font-semibold text-black">
                      {customer ? getInitials(customer.fullName) : 'US'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="mt-16">
                    <h2 className="text-xl font-semibold text-foreground">
                      {customer?.fullName || 'User Name'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {customer?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
                
                {!isEditing ? (
                  <Button 
                    onClick={handleEdit}
                    className="mt-20 bg-[#3887ee] hover:bg-[#3887ee]/90 text-white"
                  >
                    Edit
                  </Button>
                ) : (
                  <div className="mt-20 flex gap-2">
                    <Button 
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button 
                      onClick={handleCancel}
                      disabled={saving}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="bg-card rounded-2xl p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-foreground mb-2 block">
                  First Name
                </Label>
                <Input 
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name" 
                  className="bg-muted border-border"
                  disabled={!isEditing || saving}
                />
              </div>
              
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium text-foreground mb-2 block">
                  Last Name
                </Label>
                <Input 
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name" 
                  className="bg-muted border-border"
                  disabled={!isEditing || saving}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-foreground mb-2 block">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-muted border-border pl-10"
                    disabled={!isEditing || saving}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-foreground mb-2 block">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-muted border-border pl-10"
                    disabled={!isEditing || saving}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Success!
              </h3>
              <p className="text-gray-600 mb-6">
                Your profile has been updated successfully.
              </p>
              <Button 
                onClick={() => setShowSuccessPopup(false)}
                className="bg-[#3887ee] hover:bg-[#3887ee]/90 text-white w-full"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;