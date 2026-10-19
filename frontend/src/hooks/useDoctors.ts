import useSWR from "swr";
import { doctorsApi, fetcher } from "../lib/api";
import type {
  DoctorFilters,
  DoctorCreateDTO,
  DoctorUpdateDTO,
} from "../types";

const LIST_KEY = "doctors";

export function useDoctors(filters: DoctorFilters = {}) {
  const key = [LIST_KEY, filters] as const;
  const { data, error, isLoading, mutate } = useSWR(key, () =>
    fetcher(() => doctorsApi.list(filters)),
  );

  const invalidate = () => mutate();

  const create = async (payload: DoctorCreateDTO) => {
    const created = await doctorsApi.create(payload);
    await invalidate();
    return created;
  };

  const update = async (id: string, payload: DoctorUpdateDTO) => {
    const updated = await doctorsApi.update(id, payload);
    await invalidate();
    return updated;
  };

  const remove = async (id: string) => {
    await doctorsApi.remove(id);
    await invalidate();
  };

  return {
    doctors: data ?? [],
    error,
    isLoading,
    create,
    update,
    remove,
    invalidate,
    mutate,
  };
}

export function useDoctor(id: string | null) {
  const { data, error, isLoading } = useSWR(id ? ["doctor", id] : null, () =>
    fetcher(() => doctorsApi.get(id!)),
  );
  return { doctor: data, error, isLoading };
}

export function useMyDoctorProfile() {
  const { data, error, isLoading, mutate } = useSWR("doctors/me", () =>
    fetcher(() => doctorsApi.me()),
  );

  const update = async (payload: DoctorUpdateDTO) => {
    const updated = await doctorsApi.updateMe(payload);
    await mutate(updated, { revalidate: false });
    return updated;
  };

  return { doctor: data, error, isLoading, update };
}
