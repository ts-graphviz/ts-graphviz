/**
 * Type indicating that it is a constructor of T.
 * @hidden
 */
export type Type<T> = new (...args: any[]) => T;
