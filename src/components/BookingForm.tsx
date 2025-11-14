import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, X, Search, ShoppingCart } from "lucide-react";
import { fetchMenu, getAllCategories } from "@/api/menu.api.ts";
import { useTables } from "@/hooks/useTables";
import { useBooking } from "@/hooks/useBooking";
import { toast } from "sonner";
import {checkPhoneVerified, getCustomerByPhone} from "@/api/customer.api";
import { FirebaseOtpModal } from "@/components/FirebaseOtpModal";
import BookingSuccessDialog from "./BookingSuccessDialog";
import {BookingRequest} from "@/types";

const BookingForm = ({ selectedTables = [], onSelectedTablesChange }) => {
  const initialTableIds = selectedTables?.map(t => t.id) || [];
  const initialGuests = selectedTables?.reduce((sum, t) => sum + (t.capacity || 0), 0) || 0;

  const { addBooking } = useBooking();
  const { getTableByDay, tables, loading: tablesLoading } = useTables();

  const [formData, setFormData] = useState({
    tableIds: initialTableIds,
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    numGuests: initialGuests,
    bookingTime: "",
    notes: "",
    status: "Pending",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [selectedTableIds, setSelectedTableIds] = useState(initialTableIds);
  const [phoneVerified, setPhoneVerified] = useState(undefined);
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Pre-order states
  const [showPreOrder, setShowPreOrder] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [preOrderCart, setPreOrderCart] = useState([]);
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
    const defaultTime = "17:00";

    setFormData(prev => ({
      ...prev,
      bookingTime: `${today}T${defaultTime}:00`
    }));

    const dateEl = document.getElementById("date") as HTMLInputElement | null;
    const timeEl = document.getElementById("time") as HTMLInputElement | null;

    if (dateEl) dateEl.value = today;
    if (timeEl) timeEl.value = defaultTime;


    // Load tables for today by default
    updateTables(today);

  }, []);

  // Load menu items and categories from API
  useEffect(() => {
    if (showPreOrder && menuItems.length === 0) {
      loadMenuData();
    }
  }, [showPreOrder]);

  const loadMenuData = async () => {
    setLoadingMenu(true);
    try {
      const [itemsData, categoriesData] = await Promise.all([
        fetchMenu(),
        getAllCategories()
      ]);
      setMenuItems(itemsData);
      setFilteredItems(itemsData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error("Failed to load menu");
      console.error("Menu load error:", error);
    } finally {
      setLoadingMenu(false);
    }
  };
  useEffect(() => {
    const newIds = selectedTables?.map(t => t.id) || [];
    setSelectedTableIds(newIds);
  }, [selectedTables]);


  // Filter menu items
  useEffect(() => {
    let filtered = menuItems;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [selectedCategory, searchQuery, menuItems]);

  const handleAddToCart = (item) => {
    setAddingToCart(item.id);
    setTimeout(() => setAddingToCart(null), 500);

    setPreOrderCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i =>
            i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (itemId) => {
    setPreOrderCart(prev => prev.filter(i => i.item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity < 1) {
      handleRemoveFromCart(itemId);
      return;
    }
    setPreOrderCart(prev =>
        prev.map(i => (i.item.id === itemId ? { ...i, quantity } : i))
    );
  };

  const totalPreOrderAmount = preOrderCart.reduce(
      (sum, { item, quantity }) => sum + item.price * quantity,
      0
  );

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

  // Phone verification with debounce
  const debouncedCheckPhone = useMemo(() => {
    let timeoutId: any;

    return (phone: string) => {
      clearTimeout(timeoutId);
      if (!phone) return;

      timeoutId = setTimeout(async () => {
        try {
          // 1. Gọi API check phone đã tồn tại hay chưa
          const customer = await getCustomerByPhone(phone);
          console.log("Calling API getCustomerByPhone with:", phone);

          if (customer) {
            setPhoneVerified(true);

            // 2. Auto-fill name + email
            setFormData(prev => ({
              ...prev,
              customerName: customer.fullName,
              customerEmail: customer.email,
            }));
          } else {
            // không tồn tại thì user phải nhập
            setPhoneVerified(false);

            setFormData(prev => ({
              ...prev,
              customerName: "",
              customerEmail: "",
            }));
          }

        } catch (err) {
          console.error("Phone lookup failed", err);
          setPhoneVerified(false);
        }
      }, 1200);
    };
  }, []);


  const handlePhoneChange = (e) => {
    const phone = e.target.value;
    setFormData(prev => ({ ...prev, customerPhone: phone }));
    setPhoneVerified(undefined);
    debouncedCheckPhone(phone);
  };

  const handleOtpSuccess = () => {
    setPhoneVerified(true);
    setShowOtpModal(false);
  };

  const handleSelectDate = (e) => {
    const selectedDateTime = e.target.value;
    const selectedDate = selectedDateTime.split("T")[0];
    updateTables(selectedDate);
  };

  const updateTables = async (date) => {
    try {
      await getTableByDay(date);
    } catch (error) {
      toast.error("Failed to load tables for selected date");
    }
  };

  const handleToggleTable = (tableId) => {
    setSelectedTableIds(prev =>
        prev.includes(tableId) ? prev.filter(id => id !== tableId) : [...prev, tableId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tablesToBook = tables.filter(t => selectedTableIds.includes(t.id));
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

    // Prepare pre-order data (menu item IDs with quantities)
    const preOrderData = preOrderCart.map(({ item, quantity }) => ({
      menuItemId: item.id,
      quantity: quantity
    }));

    // Add pre-order info to notes for display purposes
    let notesWithPreOrder = formData.notes;
    if (preOrderCart.length > 0) {
      const preOrderDetails = preOrderCart
          .map(({ item, quantity }) => `${item.name} x${quantity}`)
          .join(", ");
      notesWithPreOrder = `${formData.notes ? formData.notes + "\n\n" : ""}PRE-ORDER: ${preOrderDetails}\nTotal: ${totalPreOrderAmount.toLocaleString("vi-VN")}₫`;
    }

    const dataToSend = {
      ...formData,
      tableIds: tablesToBook.map(t => t.id),
      numGuests: tablesToBook.reduce((sum, t) => sum + t.capacity, 0),
      bookingTime: bookingTimeISO,
      notes: notesWithPreOrder,
      preOrderItems: preOrderData, // Send actual menu item IDs
    };

    setIsSubmitting(true);
    try {
      const newBooking = await addBooking(dataToSend);
      setBookingResult(newBooking);
      setSuccessDialogOpen(true);
      toast.success("Booking created successfully!");

      // Reset form
      setFormData({
        tableIds: [],
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        numGuests: 0,
        bookingTime: "",
        notes: "",
        status: "Pending",
      });
      setSelectedTableIds([]);
      setPreOrderCart([]);
      setShowPreOrder(false);
      setErrors({});
    } catch (err) {
      toast.error(err.message || "Booking failed");
      console.error("Booking error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof BookingRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };
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
  return (
      <div className={`${showPreOrder ? 'grid grid-cols-2 gap-6' : 'max-w-2xl mx-auto'}`}>
        {/* Booking Form */}
        <div>
          <div className="bg-white rounded-2xl p-8 shadow-lg border space-y-6">
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

            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName">Full Name *</Label>
              <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={handleChange("customerName")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email *</Label>
              <Input
                  id="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange("customerEmail")}
              />

            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                    id="date"
                    type="date"
                    disabled={isSubmitting}
                    onChange={handleSelectDate}
                    min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input id="time" type="time" disabled={isSubmitting} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Choose Table(s) *</Label>
              <div className="grid grid-cols-2 gap-2">
                {tables
                    .filter(t => t.status.toLowerCase() === "available")
                    .map(table => (
                        <label key={table.id} className="flex items-center space-x-2">
                          <Checkbox
                              checked={selectedTableIds.includes(table.id)}
                              onCheckedChange={() => handleToggleTable(table.id)}
                              disabled={isSubmitting}
                          />
                          <span className="text-sm">
                      {table.tableNumber} - {table.capacity}{" "}
                            {table.capacity > 1 ? "Guests" : "Guest"}
                    </span>
                        </label>
                    ))}
              </div>
              {tables.filter(t => t.status.toLowerCase() === "available").length === 0 && (
                  <p className="text-sm text-gray-500">No tables available. Please select a date first.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numGuests">Number of Guests</Label>
              <Input
                  id="numGuests"
                  type="number"
                  min={1}
                  value={formData.numGuests}
                  onChange={(e) =>
                      setFormData({ ...formData, numGuests: parseInt(e.target.value) || 0 })
                  }
                  disabled={isSubmitting || selectedTableIds.length > 0}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="notes">Special Notes</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreOrder(!showPreOrder)}
                    className="gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  I want to pre-order
                  {preOrderCart.length > 0 && (
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {preOrderCart.length}
                  </span>
                  )}
                </Button>
              </div>

              {/* Pre-order tags in notes section */}
              {preOrderCart.length > 0 && (
                  <div className="mb-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xs font-medium text-blue-900 mb-2">Pre-ordered items:</div>
                    <div className="flex flex-wrap gap-2">
                      {preOrderCart.map(({ item, quantity }) => (
                          <div
                              key={item.id}
                              className="inline-flex items-center gap-2 bg-white border border-blue-300 rounded-full px-3 py-1 text-sm"
                          >
                            <span className="font-medium">{item.name}</span>
                            <span className="text-blue-600">x{quantity}</span>
                            <button
                                type="button"
                                onClick={() => handleRemoveFromCart(item.id)}
                                className="ml-1 text-red-500 hover:text-red-700 transition"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                      ))}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-blue-900">
                      Total: {totalPreOrderAmount.toLocaleString("vi-VN")}₫
                    </div>
                  </div>
              )}

              <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={handleChange("notes")}
                  rows={4}
                  disabled={isSubmitting}
                  placeholder="Any special requests..."
              />
            </div>

            <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-14"
            >
              {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    Processing...
                  </>
              ) : (
                  "Reserve Table"
              )}
            </Button>
          </div>
        </div>

        {/* Pre-Order Menu */}
        {showPreOrder && (
            <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm p-4 border-b z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Pre-Order Menu</h3>
                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPreOrder(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                      placeholder="Search menu..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9"
                  />
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button
                      onClick={() => setSelectedCategory("all")}
                      className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition ${
                          selectedCategory === "all"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 hover:bg-gray-200"
                      }`}
                  >
                    All
                  </button>
                  {categories.map((catName, index) => (
                      <button
                          key={index}
                          onClick={() => setSelectedCategory(catName)}
                          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition ${
                              selectedCategory === catName
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 hover:bg-gray-200"
                          }`}
                      >
                        {catName}
                      </button>
                  ))}
                </div>

                {/* Cart Summary */}
                {preOrderCart.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {preOrderCart.reduce((sum, item) => sum + item.quantity, 0)} items
                  </span>
                        <span className="font-bold">
                    {totalPreOrderAmount.toLocaleString("vi-VN")}₫
                  </span>
                      </div>
                    </div>
                )}
              </div>

              {/* Menu Items */}
              <div className="p-4 max-h-[800px] overflow-y-auto">
                {loadingMenu ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                      <p className="text-sm text-gray-500 mt-2">Loading menu...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No items found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {filteredItems.map(item => (
                          <div
                              key={item.id}
                              className="bg-gray-50 rounded-lg p-3 border hover:shadow-md transition"
                          >
                            <div className="flex gap-3">
                              <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-20 h-20 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm mb-1">{item.name}</h4>
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                  {item.description}
                                </p>
                                <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">
                            {item.price.toLocaleString("vi-VN")}₫
                          </span>
                                  {item.status === "available" && (
                                      <Button
                                          size="sm"
                                          onClick={() => handleAddToCart(item)}
                                          className={`transition ${
                                              addingToCart === item.id ? "bg-green-500" : "bg-blue-600"
                                          }`}
                                      >
                                        {addingToCart === item.id ? "✓" : "+"}
                                      </Button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Show quantity controls if in cart */}
                            {preOrderCart.find(i => i.item.id === item.id) && (
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                                  <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                          handleUpdateQuantity(
                                              item.id,
                                              (preOrderCart.find(i => i.item.id === item.id)?.quantity || 1) - 1
                                          )
                                      }
                                  >
                                    -
                                  </Button>
                                  <span className="font-medium">
                          {preOrderCart.find(i => i.item.id === item.id)?.quantity}
                        </span>
                                  <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                          handleUpdateQuantity(
                                              item.id,
                                              (preOrderCart.find(i => i.item.id === item.id)?.quantity || 0) + 1
                                          )
                                      }
                                  >
                                    +
                                  </Button>
                                  <Button
                                      size="sm"
                                      variant="destructive"
                                      className="ml-auto"
                                      onClick={() => handleRemoveFromCart(item.id)}
                                  >
                                    Remove
                                  </Button>
                                </div>
                            )}
                          </div>
                      ))}
                    </div>
                )}
              </div>
            </div>
        )}

        {showOtpModal && (
            <FirebaseOtpModal
                phone={formData.customerPhone}
                onSuccess={handleOtpSuccess}
                onClose={() => setShowOtpModal(false)}
            />
        )}

        {successDialogOpen && (
            <BookingSuccessDialog
                open={successDialogOpen}
                onClose={() => {
                  setSuccessDialogOpen(false);
                  setBookingResult(null);
                }}
                bookingResult={bookingResult}
            />
        )}
      </div>
  );
};

export default BookingForm;