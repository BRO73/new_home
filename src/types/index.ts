
export interface CategoryResponse {
    id: number;
    name: string;   // "main", "appetizer", "dessert", "beverage", "special"
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
    categoryName: string; // lưu name của category
}

export interface MenuItem {
    id: number;
    name: string;
    description: string;
    imageUrl?: string;
    price: number;
    status: "available" | "unavailable" | "seasonal";
    category: string; // 
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
    content: T[];          // danh sách dữ liệu thực sự (list item)
    totalPages: number;    // tổng số trang
    totalElements: number; // tổng số phần tử
    size: number;          // số item mỗi trang
    number: number;        // số trang hiện tại (0-based)
    first: boolean;
    last: boolean;
    empty: boolean;
}


export interface Table {
    id: string;
    name: string;
    capacity: number;
    type: 'square' | 'circle';
    position: { x: number; y: number };
    isAvailable?: boolean;
}

export interface Floor {
    id: number;
    name: string;
    tables: Table[];
}

export interface BookingInfo {
    name: string;
    phone: string;
    email: string;
    date: string;
    time: string;
    guests: number;
    note?: string; // Thêm trường note (tùy chọn)
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
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    createdAt: string;
    updatedAt: string;
}

export interface CreateBookingRequest {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    bookingTime: string; // Combined date and time field
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
  