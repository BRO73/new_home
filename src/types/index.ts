
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


export interface FloorElement {
    id: number;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    color?: string;
    label?: string;
    floor: string;
    tableId?: number;
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
export interface BookingRequest {
    tableIds: number[]; // Danh sách ID bàn
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    numGuests: number;
    status?: string; // Có thể bỏ trống, mặc định Pending
    notes?: string;
    staffId?: number;
    bookingTime: string; // ISO format: 'yyyy-MM-ddTHH:mm:ss'
}

export interface TableSimpleResponse {
    id: number;
    tableNumber: string;
    capacity: number;
    status: string;
}


export interface CustomerSimpleResponse {
    id: number;
    username: string;
}



export interface BookingResponse {
    id: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    bookingTime: string; // ISO 8601 format, e.g. '2025-11-04T17:30:00'
    numGuests: number;
    notes: string;
    status: string;
    table: TableSimpleResponse[];
    customer: CustomerSimpleResponse;
    createdAt: string;
    updatedAt: string;
}
// Location
export interface LocationResponse {
    id: number;
    name: string;
    description?: string;
}
export interface TableResponse {
    id: number;
    tableNumber: string;
    capacity: number;
    locationId: number;
    locationName: string;
    status: "Available" | "Occupied" | "Reserved" | "Maintenance";
}