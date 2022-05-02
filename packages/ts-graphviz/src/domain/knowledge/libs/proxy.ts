// eslint-disable-next-line @typescript-eslint/ban-types
export function createProxy<T extends object, O extends object = object>(o: O): T {
  const handler: ProxyHandler<T> = {
    get: (_, key: string) => key,
  };
  return new Proxy(Object.freeze(o) as T & O, handler);
}
