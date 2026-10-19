import useSWR from "swr";
import { authApi, fetcher } from "../lib/api";
import type { CurrentUser } from "../types";

export function useCurrentUser() {
  const { data, error, isLoading, mutate } = useSWR(
    "auth/me",
    () => fetcher(() => authApi.me()),
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    },
  );
  return { user: data as CurrentUser | undefined, error, isLoading, refresh: mutate };
}
