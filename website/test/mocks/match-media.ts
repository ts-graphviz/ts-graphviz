/**
 * Install a `window.matchMedia` where only the given queries match, e.g.
 * `['(pointer: coarse)']` for a phone. jsdom has no matchMedia of its own.
 * Call `setMatching` to change what matches, as when a tablet gets a mouse;
 * listeners are notified.
 */
export function mockMatchMedia(matching: string[]): {
  setMatching(next: string[]): void;
} {
  let current = matching;
  const listeners = new Set<() => void>();
  window.matchMedia = (query: string) =>
    ({
      get matches() {
        return current.includes(query);
      },
      media: query,
      onchange: null,
      addEventListener: (_: string, listener: () => void) =>
        listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) =>
        listeners.delete(listener),
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
  return {
    setMatching(next) {
      current = next;
      for (const listener of listeners) listener();
    },
  };
}
