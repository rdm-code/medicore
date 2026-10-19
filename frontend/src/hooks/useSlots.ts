import useSWR from "swr";
import { slotsApi, fetcher } from "../lib/api";

export function useAvailableSlots(
  doctorId: string | null,
  date: string | null,
) {
  const { data, error, isLoading } = useSWR(
    doctorId && date ? ["slots", doctorId, date] : null,
    () => fetcher(() => slotsApi.available(doctorId!, date!)),
  );

  return { slots: data ?? [], error, isLoading };
}
