import { useState } from "react";
import { toast } from "sonner";
import { BookingInfo, BookingResult } from '@/types';
import { createBooking, formatBookingData } from '@/api/booking.api';
import BookingSuccessDialog from "./BookingSuccessDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const BookingForm = () => {
  const [formData, setFormData] = useState<BookingInfo>({
    name: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    guests: 2,
    note: "",
  });
  const [errors, setErrors] = useState<Partial<BookingInfo>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<BookingInfo> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.time) {
      newErrors.time = "Time is required";
    }

    if (formData.guests < 1 || formData.guests > 20) {
      newErrors.guests = 1;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingDataToSend = {
        ...formatBookingData(formData),
        notes: formData.note || ""
      };
      
      const result = await createBooking(bookingDataToSend) as any;
      
      const completeBookingResult: BookingResult = {
        id: result?.id,
        bookingNumber: result?.bookingNumber || result?.id || `BOOK-${Date.now()}`,
        name: result?.name || formData.name,
        guests: result?.guests || formData.guests,
        booking_time: result?.bookingTime || `${formData.date}T${formData.time}:00`,
        status: result?.status || "Pending",
        notes: result?.notes || formData.note || "",
        originalFormData: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          date: formData.date,
          time: formData.time,
          guests: formData.guests,
          note: formData.note || ""
        }
      };
      
      setBookingResult(completeBookingResult);
      setSuccessDialogOpen(true);

      setFormData({
        name: "",
        phone: "",
        email: "",
        date: "",
        time: "",
        guests: 2,
        note: "",
      });
      setErrors({});
      
    } catch (error: any) {
      toast.error("Booking failed", {
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof BookingInfo) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ 
      ...formData, 
      [field]: e.target.value 
    });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
    setBookingResult(null);
  };

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 shadow-elegant border border-border/50 backdrop-blur-sm animate-fade-in">
          <div className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleChange("name")}
                placeholder="Enter your full name"
                disabled={isSubmitting}
                className={`h-12 text-base transition-all ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              />
              {errors.name && (
                <p className="text-sm text-destructive animate-slide-up">{errors.name}</p>
              )}
            </div>

            {/* Phone and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-semibold">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange("phone")}
                  placeholder="(123) 456-7890"
                  disabled={isSubmitting}
                  className={`h-12 text-base transition-all ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive animate-slide-up">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  placeholder="your@email.com"
                  disabled={isSubmitting}
                  className={`h-12 text-base transition-all ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-destructive animate-slide-up">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-base font-semibold">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange("date")}
                  min={new Date().toISOString().split("T")[0]}
                  disabled={isSubmitting}
                  className={`h-12 text-base transition-all ${errors.date ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {errors.date && (
                  <p className="text-sm text-destructive animate-slide-up">{errors.date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-base font-semibold">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange("time")}
                  disabled={isSubmitting}
                  className={`h-12 text-base transition-all ${errors.time ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {errors.time && (
                  <p className="text-sm text-destructive animate-slide-up">{errors.time}</p>
                )}
              </div>
            </div>

            {/* Number of Guests */}
            <div className="space-y-2">
              <Label htmlFor="guests" className="text-base font-semibold">Number of Guests *</Label>
              <Select
                value={formData.guests.toString()}
                onValueChange={(value) => {
                  setFormData({ ...formData, guests: parseInt(value) });
                  if (errors.guests) {
                    setErrors({ ...errors, guests: undefined });
                  }
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select number of guests" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "Guest" : "Guests"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Special Notes */}
            <div className="space-y-2">
              <Label htmlFor="note" className="text-base font-semibold">Special Notes (Optional)</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={handleChange("note")}
                placeholder="Any special requirements, allergies, or preferences..."
                disabled={isSubmitting}
                rows={4}
                className="text-base resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-lg font-bold"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Reservation...
                </>
              ) : (
                "Reserve Table"
              )}
            </Button>
          </div>
        </form>
      </div>

      <BookingSuccessDialog
        open={successDialogOpen}
        onClose={handleCloseSuccessDialog}
        bookingResult={bookingResult}
      />
    </>
  );
};

export default BookingForm;
