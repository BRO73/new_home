import api from "./axiosInstance";
import { TableResponse, Table } from "@/types/index";

/**
 * Lấy thông tin bàn theo ID
 */
export const getTableById = async (tableId: number): Promise<Table> => {
  const response = await api.get<TableResponse>(`/tables/${tableId}`);
  return mapToTable(response.data);
};

/**
 * Lấy tất cả bàn
 */
export const getAllTables = async (): Promise<Table[]> => {
  const response = await api.get<TableResponse[]>("/tables");
  return response.data.map(mapToTable);
};

/**
 * Map response từ backend sang Table type
 */
const mapToTable = (res: TableResponse): Table => ({
  id: res.id,
  tableNumber: res.tableNumber,
  capacity: res.capacity,
  locationId: res.locationId,
  section: res.locationName,
  status: res.status.toLowerCase() as Table["status"],
  createdAt: res.createdAt,
  updatedAt: res.updatedAt,
  deleted: res.deleted,
  activated: res.activated,
});
