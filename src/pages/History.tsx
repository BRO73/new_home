// Updated History Page using real API data via useBooking and getBookingsByCustomer
// --- Paste this into your History.tsx ---

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, CheckCircle, XCircle, Clock4 } from 'lucide-react';
import { useBooking } from '@/hooks/useBooking';
import { getBookingsByCustomer } from '@/api/booking.api';
import { BookingResponse } from '@/types/index.ts';

const History = () => {
  const { bookings, loading, error, fetchBookings } = useBooking();
  const [customerBookings, setCustomerBookings] = useState<BookingResponse[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 🔥 Fetch bookings of current customer (replace "1" with actual logged-in user ID)
  const customerId = localStorage.getItem('customerId').toString(); // TODO: get from auth context

  useEffect(() => {
    const loadCustomerBookings = async () => {
      try {
        const data = await getBookingsByCustomer(Number.parseInt(customerId));
        setCustomerBookings(data);
      } catch (err) {
        console.error("Failed to load customer bookings", err);
      }
    };

    loadCustomerBookings();
  }, []);

  // ⏳ Clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'confirmed': return <Clock4 className="w-4 h-4 text-blue-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock4 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-background mt-16">
          <main className="ml-16 p-8">
            <div className="max-w-6xl mx-auto text-center py-10">Loading booking history...</div>
          </main>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-background mt-16">
        <main className="ml-16 p-8">
          <div className="max-w-6xl mx-auto">

            {/* Header */}
            <header className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-semibold">Booking History</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                  {' • '}
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </p>
              </div>
            </header>

            {/* List */}
            <div className="bg-card rounded-2xl shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Your Reservations ({customerBookings.length})</h2>
              </div>

              <div className="divide-y">
                {customerBookings.map((b) => (
                    <div key={b.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">

                          <div className="flex items-center gap-4 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(b.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(b.status)}
                            {b.status}
                          </div>
                        </span>
                            <span className="text-sm text-muted-foreground">Booking #{b.id}</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span className="text-sm font-medium">{formatDate(b.bookingTime)}</span></div>
                            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span className="text-sm font-medium">{b.bookingTime.substring(11, 16)}</span></div>
                            <div className="flex items-center gap-2"><Users className="w-4 h-4" /><span className="text-sm font-medium">{b.numGuests} guests</span></div>
                            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span className="text-sm font-medium">{b.table.map(t => t.tableNumber).join(', ')}</span></div>
                          </div>

                          {b.notes && (
                              <div className="mb-3">
                                <p className="text-sm text-muted-foreground">Notes:</p>
                                <p className="text-sm">{b.notes}</p>
                              </div>
                          )}

                          {/* Total amount: if your backend returns this */}
                          {b.status.toLowerCase() === 'completed' && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Total Amount:</span>
                                <span className="text-lg font-semibold">{formatCurrency(0)}</span>
                              </div>
                          )}
                        </div>
                      </div>
                    </div>
                ))}
              </div>

              {customerBookings.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground">No booking history found.</div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-card rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><CheckCircle className="w-6 h-6 text-green-600" /></div>
                  <div>
                    <p className="text-2xl font-bold">{customerBookings.filter(b => b.status === 'completed').length}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Clock4 className="w-6 h-6 text-blue-600" /></div>
                  <div>
                    <p className="text-2xl font-bold">{customerBookings.filter(b => b.status === 'confirmed').length}</p>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center"><Users className="w-6 h-6 text-gray-600" /></div>
                  <div>
                    <p className="text-2xl font-bold">{customerBookings.reduce((total, b) => total + b.numGuests, 0)}</p>
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