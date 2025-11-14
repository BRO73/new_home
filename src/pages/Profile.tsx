import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CustomerResponse } from '@/types';
import { getCustomerByPhoneNumber } from '@/api/customer.api';

const Profile = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Lấy thông tin user từ API
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const userPhone = localStorage.getItem('userPhone');
        if (userPhone) {
          const customerData = await getCustomerByPhoneNumber(userPhone);
          setCustomer(customerData);
          
          // Tách fullName thành firstName và lastName
          const nameParts = customerData.fullName.split(' ');
          if (nameParts.length > 1) {
            setFirstName(nameParts[0]);
            setLastName(nameParts.slice(1).join(' '));
          } else {
            setFirstName(customerData.fullName);
            setLastName('');
          }
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

  // Hàm tạo màu ngẫu nhiên cho avatar
  const generateRandomColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  // Lấy chữ cái đầu cho avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
                  <Avatar 
                    className="w-28 h-28 border-4 border-card shadow-lg" 
                    style={{ 
                      backgroundColor: customer ? generateRandomColor(customer.fullName) : '#3887ee'
                    }}
                  >
                    <AvatarFallback className=" text-2xl font-semibold">
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
                
                <Button className="mt-20 bg-[#3887ee] hover:bg-[#3887ee]/90 text-white">
                  Edit
                </Button>
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
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <Label htmlFor="gender" className="text-sm font-medium text-foreground mb-2 block">
                  Gender
                </Label>
                <Select>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-foreground mb-2 block">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="phoneNumber"
                    value={customer?.phoneNumber || ''}
                    readOnly
                    className="bg-muted border-border pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground mb-4 block">
                Email Address
              </Label>
              
              <div className="bg-muted rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3887ee]/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#3887ee]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {customer?.email || 'No email provided'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Primary email</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;