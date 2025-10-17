import api from "@/api/axiosInstance";
import { MenuItem, MenuItemResponse, PageResponse } from "@/types";

const mapToMenuItem = (res: MenuItemResponse): MenuItem => ({
  id: res.id,
  name: res.name,
  description: res.description,
  imageUrl: res.imageUrl,
  price: res.price,
  status: res.status.toLowerCase() as "available" | "unavailable" | "seasonal",
  category: res.categoryName, // ✅ map categoryName -> category
});

// --- API functions ---
export const fetchMenu = async (): Promise<MenuItem[]> => {
  const { data } = await api.get<MenuItemResponse[]>("/menu-items");
  return data.map(mapToMenuItem);
};

export const getAllCategories = async (): Promise<string[]> => {
  const { data } = await api.get<any[]>('/categories');
  return data.map(category => category.name).filter(Boolean);
};

export const getMenuItemsPaged = async (
  page: number = 0,
  size: number = 5
): Promise<PageResponse<MenuItem>> => {
  const { data } = await api.get<PageResponse<MenuItemResponse>>(
      `/menu-items/paged?page=${page}&size=${size}`
  );

  return {
      ...data,
      content: data.content.map(mapToMenuItem),
  };
};