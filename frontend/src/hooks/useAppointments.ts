import useSWR, { mutate as globalMutate } from "swr";
import { appointmentsApi, fetcher } from "../lib/api";
import type { AppointmentFilters, AppointmentCreateDTO } from "../types";

const ADMIN_KEY = "admin/appointments";
const MINE_KEY = "appointments/me";

export function useAdminAppointments(filters: AppointmentFilters = {}) {
  const key = [ADMIN_KEY, filters] as const;
  const { data, error, isLoading, mutate } = useSWR(key, () =>
    fetcher(() => appointmentsApi.list(filters)),
  );

  const invalidate = () =>
    globalMutate((k) => Array.isArray(k) && k[0] === ADMIN_KEY);

  const remove = async (id: string) => {
    await appointmentsApi.remove(id);
    await invalidate();
  };

  return {
    appointments: data ?? [],
    error,
    isLoading,
    remove,
    invalidate,
    mutate,
  };
}

export function useMyAppointments() {
  const { data, error, isLoading, mutate } = useSWR(MINE_KEY, () =>
    fetcher(() => appointmentsApi.mine()),
  );

  const invalidate = () => globalMutate(MINE_KEY);

  const create = async (payload: AppointmentCreateDTO) => {
    const created = await appointmentsApi.create(payload);
    await invalidate();
    return created;
  };

  const cancel = async (id: string) => {
    // Optimistic
    await mutate(
      (current) =>
        current?.map((a) =>
          String(a.id) === id ? { ...a, status: "CANCELLED" as const } : a,
        ),
      { revalidate: false },
    );
    try {
      const updated = await appointmentsApi.cancel(id);
      await invalidate();
      return updated;
    } catch (e) {
      await invalidate();
      throw e;
    }
  };

  const complete = async (id: string) => {
    await mutate(
      (current) =>
        current?.map((a) =>
          String(a.id) === id ? { ...a, status: "COMPLETED" as const } : a,
        ),
      { revalidate: false },
    );
    try {
      const updated = await appointmentsApi.complete(id);
      await invalidate();
      return updated;
    } catch (e) {
      await invalidate();
      throw e;
    }
  };

  const addNotes = async (id: string, notes: string) => {
    const updated = await appointmentsApi.addNotes(id, {notes});
    await invalidate();
    return updated;
  };

  return {
    appointments: data ?? [],
    error,
    isLoading,
    create,
    cancel,
    complete,
    addNotes,
    invalidate,
  };
}
