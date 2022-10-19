export type Format = 'png' | 'svg' | 'json' | 'jpg' | 'pdf' | 'xdot' | 'plain' | 'dot_json';

export interface Options {
  format?: Format;
  suppressWarnings?: boolean;
  dotCommand?: string;
}
