// src/api/booking.api.ts
import api from './axiosInstance';
import { BookingInfo, BookingResponse, CreateBookingRequest } from '@/types';

/**
 * Create new booking
 */
export const createBooking = async (bookingData: CreateBookingRequest): Promise<BookingResponse> => {
  try {
    const response = await api.post<BookingResponse>('/bookings', bookingData);
    return response.data;
  } catch (error) {
    // Generic error message as requested
    throw new Error("Something went wrong. Please try again.");
  }
};

/**
 * Format booking data for API request
 */
export const formatBookingData = (bookingData: BookingInfo): CreateBookingRequest => {
  // Combine date and time into booking_time
  const bookingTime = `${bookingData.date}T${bookingData.time}:00`;
  
  // Format phone number
  const formattedPhone = bookingData.phone.replace(/\D/g, '');
  
  return {
    customerName: bookingData.name,
    customerPhone: formattedPhone,
    customerEmail: bookingData.email,
    bookingTime,
    numGuests: Number(bookingData.guests),
  };
};

export default {
  createBooking,
  formatBookingData
};