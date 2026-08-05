"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe media query hook via `useSyncExternalStore`. Returns `false` on
 * the server and during hydration, then syncs with the real value.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
