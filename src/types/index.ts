export interface CategoryResponse {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
}
export interface CategoryRequest {
  name: string;
  description: string;
  imageUrl: string;
}

export interface MenuItemResponse {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  status: "available" | "unavailable" | "seasonal";
  categoryName: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  activated: boolean;
}

export interface MenuItemFormData {
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  status: "available" | "unavailable" | "seasonal";
  categoryName: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  price: number;
  status: "available" | "unavailable" | "seasonal";
  category: string;
}

export interface MenuItemOrder {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  category: string;
}

export interface CartItem extends MenuItemOrder {
  quantity: number;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface FloorPlanTable {
  id: string;
  name: string;
  capacity: number;
  type: "square" | "circle";
  position: { x: number; y: number };
  isAvailable?: boolean;
}

export interface Floor {
  id: number;
  name: string;
  tables: FloorPlanTable[];
}

export interface BookingInfo {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  note?: string;
}

export interface BookingResponse {
  id: string;
  bookingNumber: string;
  name: string;
  phone: string;
  email: string;
  bookingTime: string;
  guests: number;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  bookingTime: string;
  numGuests: number;
  note?: string;
}

export interface Booking {
  id: string;
  bookingNumber: number;
  name: string;
  phone: string;
  email: string;
  booking_time: string;
  guests: number;
  status: string;
  notes: string | null;
  createdAt: string;
  userId: string;
  originalFormData?: {
    name: string;
    phone: string;
    email: string;
    date: string;
    time: string;
    guests: number;
    note: string;
  };
  customerName?: string;
  customerPhone?: string;
  numGuests?: number;
  updatedAt?: string;
}

export interface BookingResult {
  id?: string;
  bookingNumber?: string;
  name?: string;
  guests?: number;
  booking_time?: string;
  bookingTime?: string;
  status?: string;
  notes?: string;
  originalFormData?: BookingInfo;
}

export interface TableResponse {
  id: number;
  tableNumber: string;
  capacity: number;
  locationId: number;
  locationName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  activated: boolean;
}

export interface Table {
  id: number;
  tableNumber: string;
  capacity: number;
  locationId: number;
  section: string;
  status: "available" | "occupied" | "reserved" | "maintenance" | string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  activated: boolean;
}

export interface StaffResponse {
  id: number;
  fullName: string;
}

export interface OrderDetailResponse {
  id: number;
  menuItem: MenuItemResponse;
  quantity: number;
  price: number;
  specialRequirements?: string;
}

export interface OrderDetailRequest {
  menuItemId: number;
  quantity: number;
  specialRequirements?: string;
}

export interface CreateOrderRequest {
  tableId: number;
  note?: string;
  promotionId?: number;
  items: OrderDetailRequest[];
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  orderTime: string;
  status: string;
  totalAmount: number;
  note?: string;

  table: TableResponse;
  staff?: StaffResponse;

  customerUserId?: number;
  customerName?: string;

  promotionId?: number;

  items: OrderDetailResponse[];

  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
