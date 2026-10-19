import useSWR, { mutate } from "swr";
import { usersApi, fetcher } from "../lib/api";
import type {
  UserResponseDTO,
  UserCreateDTO,
  UserUpdateDTO,
  UserFilters,
} from "../types";

const key = (filters: UserFilters = {}) => ["admin/users", filters] as const;

export function useUsers(filters: UserFilters = {}) {
  const { data, error, isLoading } = useSWR(key(filters), () =>
    fetcher(() => usersApi.list(filters)),
  );

  const invalidate = () =>
    mutate((k) => Array.isArray(k) && k[0] === "admin/users");

  const create = async (payload: UserCreateDTO) => {
    const created = await usersApi.create(payload);
    await invalidate();
    return created;
  };

  const update = async (id: string, payload: UserUpdateDTO) => {
    const updated = await usersApi.update(id, payload);
    await invalidate();
    return updated;
  };

  const setEnabled = async (id: string, enabled: boolean) => {
    // optimistic
    await mutate(
      (k) => Array.isArray(k) && k[0] === "admin/users",
      (current: UserResponseDTO[] | undefined) =>
        current?.map((u) => (u.id === id ? { ...u, enabled } : u)),
      { revalidate: false },
    );
    try {
      const updated = await usersApi.setEnabled(id, enabled);
      await invalidate();
      return updated;
    } catch (e) {
      await invalidate();
      throw e;
    }
  };

  const remove = async (id: string) => {
    // Optimistic remove
    await mutate(
      (k) => Array.isArray(k) && k[0] === "admin/users",
      (current: UserResponseDTO[] | undefined) => current?.filter((u) => u.id !== id),
      { revalidate: false },
    );
    try {
      await usersApi.remove(id);
    } finally {
      await invalidate();
    }
  };

  return {
    users: data ?? [],
    error,
    isLoading,
    create,
    update,
    setEnabled,
    remove,
    invalidate,
  };
}
