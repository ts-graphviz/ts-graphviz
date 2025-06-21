/**
 * @module @ts-graphviz/adapter
 */
export type Options = any;

const ERROR_MESSAGE = 'This module cannot be run in a browser.';
/**
 * Execute the Graphviz dot command and make a Stream of the results.
 */
export function toStream(_dot: string, _options?: Options): never {
  throw new Error(ERROR_MESSAGE);
}

/**
 * Execute the Graphviz dot command and output the results to a file.
 */
export function toFile(_dot: string, _path: string, _options?: Options): never {
  throw new Error(ERROR_MESSAGE);
}
