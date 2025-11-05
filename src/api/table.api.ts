
import api from "@/api/axiosInstance";
import { TableResponse } from "@/types/index.ts";

// Mapper: API → UI
const mapToTable = (res: TableResponse): TableResponse => ({
    id: res.id,
    tableNumber: res.tableNumber,
    capacity: res.capacity,
    locationId: res.locationId,
    locationName: res.locationName,
    status: res.status as "Available" | "Occupied" | "Reserved" | "Maintenance",
});

// --- API functions ---
export const getAllTables = async (): Promise<TableResponse[]> => {
    const { data } = await api.get<TableResponse[]>("/tables");
    return data.map(mapToTable);
};

