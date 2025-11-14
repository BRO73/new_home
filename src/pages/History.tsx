import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, CheckCircle, XCircle, Clock4 } from 'lucide-react';

// Mock data for booking history
const mockBookingHistory = [
  {
    id: 1,
    date: '2024-11-15',
    time: '19:00',
    guests: 4,
    table: 'Window Table 5',
    status: 'completed',
    restaurant: 'Main Restaurant',
    specialRequests: 'Birthday celebration',
    totalAmount: 1200000
  },
  {
    id: 2,
    date: '2024-11-10',
    time: '18:30',
    guests: 2,
    table: 'Booth 3',
    status: 'completed',
    restaurant: 'Main Restaurant',
    specialRequests: 'Anniversary dinner',
    totalAmount: 850000
  },
  {
    id: 3,
    date: '2024-11-20',
    time: '20:00',
    guests: 6,
    table: 'Private Room 1',
    status: 'confirmed',
    restaurant: 'Main Restaurant',
    specialRequests: 'Business meeting',
    totalAmount: 0
  },
  {
    id: 4,
    date: '2024-11-05',
    time: '12:00',
    guests: 3,
    table: 'Garden Table 2',
    status: 'cancelled',
    restaurant: 'Main Restaurant',
    specialRequests: '',
    totalAmount: 0
  },
  {
    id: 5,
    date: '2024-10-28',
    time: '19:30',
    guests: 5,
    table: 'Family Table 8',
    status: 'completed',
    restaurant: 'Main Restaurant',
    specialRequests: 'Family gathering',
    totalAmount: 1500000
  }
];

const History = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Simulate API call
    const fetchBookingHistory = async () => {
      try {
        // In real app, this would be an API call
        setTimeout(() => {
          setBookings(mockBookingHistory);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching booking history:', error);
        setLoading(false);
      }
    };

    fetchBookingHistory();
  }, []);

  // Timer for real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'confirmed':
        return <Clock4 className="w-4 h-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock4 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'confirmed':
        return 'Confirmed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background mt-16">
        <main className="ml-16 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-center items-center py-16">
              <div className="text-center">Loading booking history...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background mt-16">
      <main className="ml-16 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Booking History
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric' 
                })} • {formatTime(currentTime)}
              </p>
            </div>
          </header>

          {/* Booking History List */}
          <div className="bg-card rounded-2xl shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-foreground">
                Your Reservations ({bookings.length})
              </h2>
            </div>

            <div className="divide-y">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(booking.status)}
                            {getStatusText(booking.status)}
                          </div>
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Booking #{booking.id}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{formatDate(booking.date)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{booking.time}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{booking.guests} guests</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{booking.table}</span>
                        </div>
                      </div>

                      {booking.specialRequests && (
                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground mb-1">Special Requests:</p>
                          <p className="text-sm text-foreground">{booking.specialRequests}</p>
                        </div>
                      )}

                      {booking.totalAmount > 0 && booking.status === 'completed' && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total Amount:</span>
                          <span className="text-lg font-semibold text-foreground">
                            {formatCurrency(booking.totalAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {bookings.length === 0 && (
              <div className="p-12 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No booking history
                </h3>
                <p className="text-muted-foreground">
                  You haven't made any reservations yet.
                </p>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-card rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {bookings.filter(b => b.status === 'completed').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock4 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {bookings.reduce((total, booking) => total + booking.guests, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Guests</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default History;