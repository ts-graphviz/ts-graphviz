/**
 * @module @ts-graphviz/adapter
 */
export type Options = any;

export const ERROR_MESSAGE = `@ts-graphviz/adapter cannot be used in browser environments.

This package requires Graphviz executables which are not available in browsers.

For browser-based Graphviz rendering, consider these alternatives:
- `@hpcc-js/wasm-graphviz` - WebAssembly-based Graphviz for browsers
- `@viz-js/viz` - JavaScript port of Graphviz

Learn more: https://github.com/ts-graphviz/ts-graphviz`;

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
