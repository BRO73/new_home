import {useState, useEffect, useCallback, useMemo} from "react";
import { toast } from "sonner";
import { BookingRequest, BookingResponse, TableResponse } from "@/types";
import { useBooking } from "@/hooks/useBooking";
import BookingSuccessDialog from "./BookingSuccessDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import {useTables} from "@/hooks/useTables.ts";
import {format} from "date-fns";
import { debounce } from "lodash";
import {checkPhoneVerified} from "@/api/customer.api.ts";
import {FirebaseOtpModal} from "@/components/FirebaseOtpModal.tsx";

interface BookingFormProps {
  selectedTables?: TableResponse[];
  onSelectedTablesChange?: (tables: TableResponse[]) => void;
}

const BookingForm = ({
                       selectedTables = [],
                       onSelectedTablesChange,
                     }: BookingFormProps) => {
  const initialTableIds: number[] = selectedTables?.map(t => t.id) || [];
  const initialGuests: number = selectedTables?.reduce((sum, t) => sum + (t.capacity || 0), 0) || 0;

  const {addBooking} = useBooking();
  const [formData, setFormData] = useState<BookingRequest>({
    tableIds: initialTableIds,
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    numGuests: initialGuests,
    bookingTime: "",
    notes: "",
    status: "Pending",
  });



  const [errors, setErrors] = useState<Partial<BookingRequest>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResponse | null>(null);


  const { getTableByDay,tables, loading: tablesLoading, error: tablesError } = useTables(); // <-- hook
  const [selectedTableIds, setSelectedTableIds] = useState<number[]>(formData.tableIds);


  const [showOtpModal, setShowOtpModal] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

// Khi nhấn "Xác thực ngay"
  const handleVerifyPhoneClick = () => setShowOtpModal(true);

// Sau khi OTP thành công


  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      tableIds: selectedTableIds,
      numGuests: selectedTableIds.length
          ? tables.filter(t => selectedTableIds.includes(t.id)).reduce((sum, t) => sum + t.capacity, 0)
          : prev.numGuests,
    }));

    if (onSelectedTablesChange) {
      onSelectedTablesChange(tables.filter(t => selectedTableIds.includes(t.id)));
    }
  }, [selectedTableIds, tables]);
  const debouncedCheckPhone = useMemo(
      () =>
          debounce(async (phone: string) => {
            if (!phone) return;

            try {
              const verified = await checkPhoneVerified(phone);
              setPhoneVerified(verified); // backend trả true/false thì set trực tiếp
            } catch (err) {
              setPhoneVerified(false);
            }
          }, 2000),
      []
  );

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value;
    setFormData(prev => ({ ...prev, customerPhone: phone }));

    // Khi nhập mới, tạm set undefined hoặc false để UI hiển thị "chưa xác thực"
    setPhoneVerified(undefined);

    // Gọi debounce kiểm tra số mới
    debouncedCheckPhone(phone);
  };

// Cleanup khi unmount component
  useEffect(() => {
    return () => {
      debouncedCheckPhone.cancel();
    };
  }, [debouncedCheckPhone]);

  const handleOtpSuccess = () => {
    setPhoneVerified(true); // cập nhật trạng thái số điện thoại đã xác thực
    setShowOtpModal(false);
  };


  // Đồng bộ tableIds và tính numGuests tự động
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      tableIds: selectedTableIds,
      numGuests: selectedTableIds.length
          ? tables.filter(t => selectedTableIds.includes(t.id)).reduce((sum, t) => sum + t.capacity, 0)
          : prev.numGuests,
    }));

    if (onSelectedTablesChange) {
      onSelectedTablesChange(tables.filter(t => selectedTableIds.includes(t.id)));
    }
  }, [selectedTableIds, tables]);

  const handleToggleTable = (tableId: number) => {
    setSelectedTableIds(prev => prev.includes(tableId) ? prev.filter(id => id !== tableId) : [...prev, tableId]);
  };

  const handleSelectDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDateTime = e.target.value; // ví dụ: "2025-11-06T20:30"
    const selectedDate = selectedDateTime.split("T")[0]; // 👉 "2025-11-06"
    const formatted = format(selectedDate, "yyyy-MM-dd");
    console.log(formatted);
    updateTables(formatted);
  };

  async function updateTables(  date : string){
    await getTableByDay(date);
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<BookingRequest> = {};
    if (!formData.customerName.trim()) newErrors.customerName = "Name is required";
    if (!formData.customerPhone.trim()) newErrors.customerPhone = "Phone is required";
    else if (!/^\d{10}$/.test(formData.customerPhone.replace(/\D/g, ""))) newErrors.customerPhone = "Invalid phone number";
    if (!formData.customerEmail.trim()) newErrors.customerEmail = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) newErrors.customerEmail = "Invalid email";
    if (!formData.bookingTime) newErrors.bookingTime = "Booking time is required";
    if (formData.numGuests < 1) newErrors.numGuests = 1;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Lấy danh sách tables hiện tại dựa vào selectedTableIds
    const tablesToBook = tables.filter(t => selectedTableIds.includes(t.id));
    console.log(tablesToBook);
    if (tablesToBook.length === 0) {
      toast.error("Please select at least one table");
      return;
    }

    const dateInput = (document.getElementById("date") as HTMLInputElement)?.value;
    const timeInput = (document.getElementById("time") as HTMLInputElement)?.value;
    if (!dateInput || !timeInput) {
      toast.error("Please select date and time");
      return;
    }

    const bookingTimeISO = `${dateInput}T${timeInput}:00`;
    const dataToSend: BookingRequest = {
      ...formData,
      tableIds: tablesToBook.map(t => t.id), // cập nhật tableIds từ selected
      numGuests: tablesToBook.reduce((sum, t) => sum + t.capacity, 0),
      bookingTime: bookingTimeISO
    };

    // if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const newBooking = await addBooking(dataToSend);
      setBookingResult(newBooking);
      setSuccessDialogOpen(true);
      // reset form
      setFormData({
        tableIds: selectedTables.map(t => t.id),
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        numGuests: 2,
        bookingTime: "",
        notes: "",
        status: "Pending",
      });
      setSelectedTableIds([]);
      setErrors({});
    } catch (err: any) {
      toast.error(err.message || "Booking failed");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleChange = (field: keyof BookingRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  return (
      <>
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 shadow-elegant border border-border/50 backdrop-blur-sm animate-fade-in space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="customerName">Full Name *</Label>
              <Input id="customerName" value={formData.customerName} onChange={handleChange("customerName")} disabled={isSubmitting} />
              {errors.customerName && <p className="text-sm text-destructive">{errors.customerName}</p>}
            </div>

            {/* Phone */}
            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone *</Label>

              {/* Hiển thị thông báo chỉ khi có số điện thoại */}
              {formData.customerPhone && (
                  <>
                    {phoneVerified === true && (
                        <p className="text-green-600">Số điện thoại đã được xác thực</p>
                    )}
                    {phoneVerified === false && (
                        <p className="text-red-600">
                          Số điện thoại chưa được xác thực.{" "}
                          <span
                              onClick={() => setShowOtpModal(true)}
                              className="text-blue-600 underline cursor-pointer"
                          >
            Xác thực ngay
          </span>
                        </p>
                    )}
                  </>
              )}

              <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={handlePhoneChange}
                  disabled={isSubmitting}
              />

              {errors.customerPhone && (
                  <p className="text-sm text-destructive">{errors.customerPhone}</p>
              )}
            </div>
            {showOtpModal && (
                <FirebaseOtpModal
                    phone={formData.customerPhone}
                    onSuccess={handleOtpSuccess}
                    onClose={() => setShowOtpModal(false)}
                />
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email *</Label>
              <Input id="customerEmail" value={formData.customerEmail} onChange={handleChange("customerEmail")} disabled={isSubmitting} />
              {errors.customerEmail && <p className="text-sm text-destructive">{errors.customerEmail}</p>}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" disabled={isSubmitting} onChange={handleSelectDate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input id="time" type="time" disabled={isSubmitting} />
              </div>
            </div>

            {/* Table selection */}
            <div className="space-y-2">
              <Label>Choose Table(s) *</Label>
              <div className="grid grid-cols-2 gap-2">
                {tables.filter((t)=> t.status.toLowerCase() === "available").map(table => (
                    <label key={table.id} className="flex items-center space-x-2">
                      <Checkbox
                          checked={selectedTableIds.includes(table.id)}
                          onCheckedChange={() => handleToggleTable(table.id)}
                          disabled={isSubmitting}
                      />
                      <span>{table.tableNumber} - {table.capacity} {table.capacity > 1 ? "Guests" : "Guest"}</span>
                    </label>
                ))}
              </div>
            </div>

            {/* Guests */}
            <div className="space-y-2">
              <Label htmlFor="numGuests">Number of Guests</Label>
              <Input
                  id="numGuests"
                  type="number"
                  min={1}
                  value={formData.numGuests}
                  onChange={(e) => setFormData({ ...formData, numGuests: parseInt(e.target.value) })}
                  disabled={isSubmitting || selectedTableIds.length > 0}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Special Notes</Label>
              <Textarea id="notes" value={formData.notes} onChange={handleChange("notes")} rows={4} disabled={isSubmitting} />
            </div>

            {/* Submit */}
            <Button type="submit" disabled={isSubmitting} className="w-full h-14">
              {isSubmitting ? <><Loader2 className="animate-spin mr-2" />Processing...</> : "Reserve Table"}
            </Button>
          </form>
        </div>

        <BookingSuccessDialog
            open={successDialogOpen}
            onClose={() => { setSuccessDialogOpen(false); setBookingResult(null); }}
            bookingResult={bookingResult}
        />
      </>
  );
};

export default BookingForm;
