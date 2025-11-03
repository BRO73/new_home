import api from "@/api/axiosInstance";
import { FloorElement} from "@/types/index.ts";

// 🧭 Mapper: API → UI
export const mapToFloorElement = (res: FloorElement) => ({
    id: res.id,
    type: res.type,
    x: res.x,
    y: res.y,
    width: res.width,
    height: res.height,
    rotation: res.rotation,
    color: res.color,
    label: res.label,
    floor: res.floor,
    tableId: res.tableId
});

// --- 📡 API functions ---

export const getAllFloorElementsApi = async () => {
    const { data } = await api.get<FloorElement[]>("/elements");
    return data.map(mapToFloorElement);
};

export const getFloorElementByIdApi = async (id: number) => {
    const { data } = await api.get<FloorElement>(`/elements/${id}`);
    return mapToFloorElement(data);
};


export const deleteFloorElementApi = async (id: number) => {
    await api.delete(`/elements/${id}`);
};
