import { useQuery } from "@tanstack/react-query";
import { getFlyerUrl } from "@/lib/forms-api";

/** Resolves a stored flyer path into a temporary viewable URL. */
export function useFlyerUrl(path: string | null | undefined) {
  const { data } = useQuery({
    queryKey: ["flyer-url", path],
    queryFn: () => getFlyerUrl(path ?? null),
    enabled: Boolean(path),
    staleTime: 1000 * 60 * 30,
  });
  return path ? (data ?? null) : null;
}
