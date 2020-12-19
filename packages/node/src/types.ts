import { ExecFileOptions } from 'child_process';

export type Format = 'png' | 'svg' | 'json' | 'jpg' | 'pdf' | 'xdot' | 'plain' | 'dot_json';

export type ChildProcessOptions = ExecFileOptions;

export type DotOption = {
  dotCommand?: string;
  childProcessOptions?: ChildProcessOptions;
};

export type OutputOption = {
  format?: Format;
  output?: string;
};

export type ExecuteDotOption = OutputOption & {
  /**
   * Suppress warning messages.
   */
  suppressWarnings?: boolean;
};

export type ExecuteOption = ExecuteDotOption & DotOption;
