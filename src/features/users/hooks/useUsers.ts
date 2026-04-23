import { useState, useEffect, useCallback } from "react";
import { usersApi } from "../api/usersApi";
import type { User, CreateUserInput, UpdateUserInput } from "../api/usersApi";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [cashierCount, setCashierCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, countData] = await Promise.all([
        usersApi.getAll(),
        usersApi.countCashiers(),
      ]);
      setUsers(usersData);
      setCashierCount(countData.count);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const create = useCallback(async (data: CreateUserInput) => {
    const created = await usersApi.create(data);
    setUsers((prev) => [...prev, created]);
    setCashierCount((c) => c + 1);
    return created;
  }, []);

  const update = useCallback(async (id: string, data: UpdateUserInput) => {
    const updated = await usersApi.update(id, data);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await usersApi.delete(id);
    const deleted = users.find((u) => u.id === id);
    if (deleted?.role === "CASHIER") {
      setCashierCount((c) => Math.max(0, c - 1));
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, [users]);

  return {
    users,
    cashierCount,
    loading,
    error,
    refetch: fetchUsers,
    create,
    update,
    remove,
  };
}
