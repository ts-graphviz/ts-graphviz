export type Format = 'png' | 'svg' | 'json' | 'jpg' | 'pdf' | 'xdot' | 'plain' | 'dot_json';

export type DotOption = {
  dotCommand?: string;
};

export type ExecuteDotOption = {
  format?: Format;
  output?: string;
};

export type ExecuteOption = ExecuteDotOption & DotOption;
