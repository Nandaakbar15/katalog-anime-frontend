import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/api";

interface AsyncResult<T> {
  id: string;
  data?: T;
  error?: string;
}

/**
 * Runs `load` whenever `key` changes (or `reload` is called) and tracks its result.
 * Results from stale keys are ignored, so `loading` is true until the current key resolves.
 */
export function useAsync<T>(key: string, load: () => Promise<T>) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<AsyncResult<T> | null>(null);
  const id = `${key}#${version}`;

  useEffect(() => {
    let ignore = false;
    load().then(
      (data) => {
        if (!ignore) setResult({ id, data });
      },
      (error) => {
        if (!ignore) setResult({ id, error: getErrorMessage(error) });
      },
    );
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const current = result?.id === id ? result : null;

  return {
    data: current?.data,
    error: current?.error,
    loading: !current,
    reload,
  };
}
