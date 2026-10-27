/**
 * @module @ts-graphviz/adapter
 */
import { withCode } from '@ts-graphviz/common';
import type { Layout, Options } from './types.js';

export { isFormat, isLayout } from './formats.js';
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
 * Not available in browsers: always throws an `Error` with
 * `code: 'TSG_ERR_UNSUPPORTED_ENVIRONMENT'`.
 */
export function toStream<T extends Layout>(
  _dot: string,
  _options?: Options<T>,
): Promise<ReadableStream<Uint8Array>> {
  throw withCode(new Error(ERROR_MESSAGE), 'TSG_ERR_UNSUPPORTED_ENVIRONMENT');
}

/**
 * Execute the Graphviz dot command and output the results to a file.
 *
 * Not available in browsers: always throws an `Error` with
 * `code: 'TSG_ERR_UNSUPPORTED_ENVIRONMENT'`.
 */
export function toFile<T extends Layout>(
  _dot: string,
  _path: string,
  _options?: Options<T>,
): Promise<void> {
  throw withCode(new Error(ERROR_MESSAGE), 'TSG_ERR_UNSUPPORTED_ENVIRONMENT');
}
