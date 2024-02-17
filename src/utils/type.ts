/**
 * @hidden
 */
export type $keywords<T extends string> = {
  [key in T]: key;
};

/**
 * @hidden
 */
export interface $keywordsValidation
  extends $keywords<
    // Note
    // Although the DOT language specification allows the use of white space characters in IDs, for example by quoting,
    // this is eliminated as a use case for the library.
    `${string} ${string}` | `${string}\n${string}` | `${string}\t${string}`
  > {}
