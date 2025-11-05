import { useEffect, useState } from "react";
import {
  getAllTables,
} from "@/api/table.api";
import { TableResponse } from "@/types/index.ts";

export const useTables = () => {
  const [tables, setTables] = useState<TableResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = async () => {
    setLoading(true);

    setError(null);
    try {
      const data = await getAllTables();
      setTables(data);
      console.log("Tables fetched:", data);

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
  };
};
