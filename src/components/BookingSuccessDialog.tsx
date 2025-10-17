import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookingResult } from "@/types";
import { CheckCircle2, Calendar, Clock, Users, Hash } from "lucide-react";

interface BookingSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  bookingResult: BookingResult | null;
}

const BookingSuccessDialog = ({ open, onClose, bookingResult }: BookingSuccessDialogProps) => {
  const formatDisplayDate = () => {
    if (!bookingResult) return "Updating...";
    
    if (bookingResult.booking_time) {
      try {
        const date = new Date(bookingResult.booking_time);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        }
      } catch {
        return bookingResult.booking_time.split('T')[0] || "Updating...";
      }
    }
    
    if (bookingResult.originalFormData?.date) {
      try {
        const date = new Date(bookingResult.originalFormData.date);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        }
      } catch {
        return bookingResult.originalFormData.date;
      }
    }
    
    return "Updating...";
  };

  const formatDisplayTime = () => {
    if (!bookingResult) return "Updating...";
    
    if (bookingResult.booking_time) {
      try {
        const date = new Date(bookingResult.booking_time);
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          });
        }
      } catch {
        const timePart = bookingResult.booking_time.split('T')[1];
        return timePart ? timePart.substring(0, 5) : "Updating...";
      }
    }
    
    if (bookingResult.originalFormData?.time) {
      return bookingResult.originalFormData.time;
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
      bookingNumber: bookingResult.bookingNumber || bookingResult.id || `BOOK-${Date.now()}`,
      name: bookingResult.name || bookingResult.originalFormData?.name || "Updating...",
      date: formatDisplayDate(),
      time: formatDisplayTime(),
      guests: bookingResult.guests || bookingResult.originalFormData?.guests || "Updating...",
      status: bookingResult.status || "Processing",
    };
  };

  const displayData = getDisplayData();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-success-bg rounded-full flex items-center justify-center animate-scale-in">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Booking Successful!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Your table has been reserved successfully. We look forward to serving you!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="bg-gradient-warm rounded-xl p-6 space-y-4 border border-border/50">
            <h3 className="font-semibold text-lg mb-3 text-foreground">Booking Details</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Hash className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Booking Number</p>
                  <p className="font-bold text-primary text-lg">{displayData.bookingNumber}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Customer Name</p>
                  <p className="font-semibold">{displayData.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">{displayData.date}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-semibold">{displayData.time}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Guests</p>
                  <p className="font-semibold">{displayData.guests}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/50">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-bold text-success text-lg">{displayData.status}</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={onClose} 
            className="w-full h-12 text-base font-bold"
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingSuccessDialog;
