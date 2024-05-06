export type Insensitive<T> = T &
  Insensitive.LowercaseKeys<T> &
  Insensitive.UppercaseKeys<T>;
export namespace Insensitive {
  export type LowercaseKeys<T> = {
    [key in keyof T as Lowercase<string & key>]: T[key];
  };
  export type UppercaseKeys<T> = {
    [key in keyof T as Uppercase<string & key>]: T[key];
  };
}
