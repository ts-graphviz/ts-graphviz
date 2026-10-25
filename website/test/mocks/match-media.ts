/**
 * Install a `window.matchMedia` where only the given queries match, e.g.
 * `['(pointer: coarse)']` for a phone. jsdom has no matchMedia of its own.
 */
export function mockMatchMedia(matching: string[]): void {
  window.matchMedia = (query: string) =>
    ({
      matches: matching.includes(query),
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
