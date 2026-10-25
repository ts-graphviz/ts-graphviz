import { useSyncExternalStore } from 'react';

/**
 * Whether a media query matches, kept up to date.
 * `undefined` while rendering on the server and during hydration, so the
 * first client render matches the static HTML.
 */
export function useMediaQuery(query: string): boolean | undefined {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window.matchMedia !== 'function') return () => {};
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () =>
      typeof window.matchMedia === 'function'
        ? window.matchMedia(query).matches
        : false,
    () => undefined,
  );
}

/**
 * Touch-first devices (phones, tablets), where Monaco is hard to use and a
 * plain text area or code block works better.
 */
export const COARSE_POINTER = '(pointer: coarse)';
