/**
 * The own properties of an options object, in an object without a
 * prototype, so that a property inherited from `Object.prototype` is never
 * read as an option.
 *
 * The property descriptors are taken in one step before any value is read,
 * so an accessor cannot remove another property and expose an inherited one.
 *
 * @internal
 */
export function ownOptions<T extends object>(options: T | undefined): T {
  const own = Object.create(null) as Record<string, unknown>;
  if (options != null) {
    const descriptors = Object.getOwnPropertyDescriptors(options);
    for (const key of Object.getOwnPropertyNames(descriptors)) {
      const descriptor = descriptors[key];
      own[key] = Object.hasOwn(descriptor, 'value')
        ? descriptor.value
        : descriptor.get?.call(options);
    }
  }
  return own as T;
}
