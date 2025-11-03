import api from "@/api/axiosInstance";
import { LocationResponse } from "@/types/index.ts";

export const getAllLocations = async (): Promise<LocationResponse[]> => {
  const { data } = await api.get<LocationResponse[]>("/locations");
  return data;
};

export const getLocationById = async (id: number): Promise<LocationResponse> => {
  const { data } = await api.get<LocationResponse>(`/locations/${id}`);
  return data;

};
