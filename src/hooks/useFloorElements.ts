import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllFloorElementsApi,
    getFloorElementByIdApi
} from "@/api/elementApi.ts";

// 🔹 Fetch all
export const useFloorElements = () => {
    return useQuery({
        queryKey: ["floor-elements"],
        queryFn: getAllFloorElementsApi,
    });
};

// 🔹 Fetch one by id
export const useFloorElement = (id: number) => {
    return useQuery({
        queryKey: ["floor-element", id],
        queryFn: () => getFloorElementByIdApi(id),
        enabled: !!id,
    });
};
