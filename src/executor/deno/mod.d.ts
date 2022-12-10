export type Format = 'png' | 'svg' | 'json' | 'jpg' | 'pdf' | 'xdot' | 'plain' | 'dot_json';

export interface Options {
  format?: Format;
  suppressWarnings?: boolean;
  dotCommand?: string;
}

export function toStream(dot: string, options?: Options): Promise<ReadableStream>;

export function toFile(dot: string, filePath: string, options?: Options): Promise<void>;
