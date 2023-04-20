/**
 * @hidden
 */
export type $keywords<T extends string> = {
  [key in T]: key;
};
