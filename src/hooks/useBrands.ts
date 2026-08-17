import { useCallback, useEffect, useState } from "react";
import { fetchBrands, type Brand } from "@/lib/brands";

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setBrands(await fetchBrands());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load brands");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { brands, loading, error, refresh, setBrands };
}
