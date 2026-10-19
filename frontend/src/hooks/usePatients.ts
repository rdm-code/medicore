import useSWR from "swr";
import { patientsApi, fetcher } from "../lib/api";
import type { PatientUpdateDTO } from "../types";

export function usePatients() {
  const { data, error, isLoading, mutate } = useSWR("admin/patients", () =>
    fetcher(() => patientsApi.list()),
  );

  const invalidate = () => mutate();

  const update = async (id: string, payload: PatientUpdateDTO) => {
    const updated = await patientsApi.update(id, payload);
    await invalidate();
    return updated;
  };

  const remove = async (id: string) => {
    await patientsApi.remove(id);
    await invalidate();
  };

  return { patients: data ?? [], error, isLoading, update, remove, invalidate };
}

export function useMyPatientProfile() {
  const { data, error, isLoading, mutate } = useSWR("patients/me", () =>
    fetcher(() => patientsApi.me()),
  );

  const update = async (payload: PatientUpdateDTO) => {
    const updated = await patientsApi.updateMe(payload);
    await mutate(updated, { revalidate: false });
    return updated;
  };

  return { patient: data, error, isLoading, update };
}
