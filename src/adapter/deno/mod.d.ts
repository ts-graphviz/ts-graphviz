export type Format = 'png' | 'svg' | 'json' | 'jpg' | 'pdf' | 'xdot' | 'plain' | 'dot_json';

export interface Options {
  format?: Format;
  suppressWarnings?: boolean;
  dotCommand?: string;
}

/**
 * Execute the Graphviz dot command and make a Stream of the results.
 */
export function toStream(dot: string, options?: Options): Promise<ReadableStream>;

/**
 * Execute the Graphviz dot command and output the results to a file.
 */
export function toFile(dot: string, path: string, options?: Options): Promise<void>;
