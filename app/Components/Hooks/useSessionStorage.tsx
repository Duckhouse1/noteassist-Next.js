import { useEffect, useMemo, useState } from "react";

type Options<T> = {
  key: string;
  initialValue: T;
  version?: number;
};

export function useSessionStorageState<T>({ key,initialValue, version = 1,}: Options<T>) {
  const storageKey = useMemo(() => `${key}::v${version}`, [key, version]);

  const read = (): T => {
    if (typeof window === "undefined") return initialValue;
    try {
      const raw = window.sessionStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const [value, setValue] = useState<T>(read);

  // ✅ CRITICAL: when storageKey changes (e.g. projectId changes),
  // re-hydrate value from sessionStorage for that new key
  useEffect(() => {
    setValue(read());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // persist on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [storageKey, value]);

  return { value, setValue };
}
