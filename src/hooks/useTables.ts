import { useEffect, useState } from "react";
import {
  getAllTables,
  getTableById,
  getTableStatusByDay,
} from "@/api/table.api";
import { TableResponse } from "@/types/index.ts";

export const useTables = () => {
  const [tables, setTables] = useState<TableResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Hàm sắp xếp theo tableNumber (alphabet + số)
  const sortTablesByNumber = (data: TableResponse[]) => {
    return [...data].sort((a, b) => {
      const aNum = a.tableNumber.match(/\d+/);
      const bNum = b.tableNumber.match(/\d+/);
      const aPrefix = a.tableNumber.match(/[A-Za-z]+/);
      const bPrefix = b.tableNumber.match(/[A-Za-z]+/);

      // So sánh phần chữ trước
      if (aPrefix && bPrefix) {
        const cmp = aPrefix[0].localeCompare(bPrefix[0]);
        if (cmp !== 0) return cmp;
      }

      // So sánh phần số (nếu có)
      const numA = aNum ? parseInt(aNum[0], 10) : 0;
      const numB = bNum ? parseInt(bNum[0], 10) : 0;
      return numA - numB;
    });
  };

  // 🔹 Fetch all tables
  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllTables();
      setTables(sortTablesByNumber(data));
    } catch (err: any) {
      setError(err.message || "Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  };

  const fetchTableById = async (id: number) => {
    return await getTableById(id);
  };


  // 🔹 Get table status by day
  const getTableByDay = async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTableStatusByDay(date);
      setTables(sortTablesByNumber(data));
    } catch (err: any) {
      setError(err.message || "Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  return {
    tables,
    loading,
    error,
    fetchTables,
    fetchTableById,
    getTableByDay,
  };
};
