import { Options, Format, Layout } from '../types/index.ts';

/**
 * Execute the Graphviz dot command and make a Stream of the results.
 */
export function toStream<T extends Layout>(dot: string, options?: Options<T>): Promise<ReadableStream<Uint8Array>>;

/**
 * Execute the Graphviz dot command and output the results to a file.
 */
export function toFile<T extends Layout>(dot: string, path: string, options?: Options<T>): Promise<void>;

export { Options, Format, Layout };
