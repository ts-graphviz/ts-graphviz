/**
 * @module @ts-graphviz/adapter
 */
import { UnsupportedEnvironmentError } from '@ts-graphviz/common';
import type { Layout, Options } from './types.js';

export type * from './types.js';

export const ERROR_MESSAGE = `@ts-graphviz/adapter cannot be used in browser environments.

This package requires Graphviz executables which are not available in browsers.

For browser-based Graphviz rendering, consider these alternatives:
- @hpcc-js/wasm-graphviz - WebAssembly-based Graphviz for browsers
- @viz-js/viz - JavaScript port of Graphviz

Learn more: https://github.com/ts-graphviz/ts-graphviz`;

/**
 * Execute the Graphviz dot command and make a Stream of the results.
 *
 * Not available in browsers: always throws {@link UnsupportedEnvironmentError}.
 */
export function toStream<T extends Layout>(
  _dot: string,
  _options?: Options<T>,
): Promise<ReadableStream<Uint8Array>> {
  throw new UnsupportedEnvironmentError(ERROR_MESSAGE);
}

/**
 * Execute the Graphviz dot command and output the results to a file.
 *
 * Not available in browsers: always throws {@link UnsupportedEnvironmentError}.
 */
export function toFile<T extends Layout>(
  _dot: string,
  _path: string,
  _options?: Options<T>,
): Promise<void> {
  throw new UnsupportedEnvironmentError(ERROR_MESSAGE);
}
