import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookingResponse } from "@/types/index";
import { CheckCircle2, Calendar, Clock, Users, Hash } from "lucide-react";

interface BookingSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  bookingResult: BookingResponse | null;
}

const BookingSuccessDialog = ({ open, onClose, bookingResult }: BookingSuccessDialogProps) => {
  const formatDisplayDate = () => {
    if (!bookingResult) return "Updating...";

    if (bookingResult.bookingTime) {
      try {
        const date = new Date(bookingResult.bookingTime);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      } catch {
        return bookingResult.bookingTime.split('T')[0] || "Updating...";
      }
    }


    return "Updating...";
  };

  const formatDisplayTime = () => {
    if (!bookingResult) return "Updating...";

    if (bookingResult.bookingTime) {
      try {
        const date = new Date(bookingResult.bookingTime);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
        }
      } catch {
        const timePart = bookingResult.bookingTime.split('T')[1];
        return timePart ? timePart.substring(0, 5) : "Updating...";
      }
    }


    return "Updating...";
  };

  const getDisplayData = () => {
    if (!bookingResult) {
      return {
        bookingNumber: "Updating...",
        name: "Updating...",
        date: "Updating...",
        time: "Updating...",
        guests: "Updating...",
        status: "Processing",
      };
    }

    return {
      bookingNumber: bookingResult.id || bookingResult.id || `BOOK-${Date.now()}`,
      name: bookingResult.customerName || "Updating...",
      date: formatDisplayDate(),
      time: formatDisplayTime(),
      guests: bookingResult.table.filter((t) => t.tableNumber).join(",") || "Updating...",
      status: bookingResult.status || "Processing",
    };
  };

  const displayData = getDisplayData();

  return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md animate-scale-in font-sans">
          <DialogHeader className="space-y-4">
            <div
                className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
              <CheckCircle2 className="w-10 h-10 text-green-600"/>
            </div>
            <DialogTitle className="text-xl font-bold text-center text-gray-900">
              Booking Successful!
            </DialogTitle>
            <DialogDescription className="text-center text-base text-gray-700">
              Your table has been reserved successfully. We look forward to serving you!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="bg-green-50 rounded-xl p-6 space-y-4 border border-gray-200">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">Booking Details</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Hash className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"/>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Booking Number</p>
                    <p className="font-medium text-gray-800">{displayData.bookingNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"/>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Customer Name</p>
                    <p className="font-medium text-gray-800">{displayData.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"/>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-800">{displayData.date}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"/>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium text-gray-800">{displayData.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"/>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Guests</p>
                    <p className="font-medium text-gray-800">{displayData.guests}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-bold text-green-600">{displayData.status}</p>
                </div>
              </div>
            </div>

            <Button
                onClick={onClose}
                className="w-full h-12 text-base font-medium text-gray-900 bg-green-100 hover:bg-green-200"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  );
}
  export default BookingSuccessDialog;
