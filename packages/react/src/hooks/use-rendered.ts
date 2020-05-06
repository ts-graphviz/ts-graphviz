import { useState, useEffect } from 'react';
import { graphviz } from '@hpcc-js/wasm';

export type Format = 'svg' | 'dot' | 'json' | 'dot_json' | 'xdot_json';

export type Engine = 'circo' | 'dot' | 'fdp' | 'neato' | 'osage' | 'patchwork' | 'twopi';
export type Image = {
  path: string;
  width: string;
  height: string;
};
export type File = {
  path: string;
  data: string;
};

export const useRendered = (
  dot: string,
  engine?: Engine,
  format?: Format,
  ext?: {
    images?: Image[];
    files?: File[];
  },
): string | undefined => {
  const [rendered, setRendered] = useState<string>();
  useEffect(() => {
    (async (): Promise<void> => {
      const result = await graphviz.layout(dot, format, engine, ext);
      setRendered(result);
    })();
  }, [dot, engine, format, ext, setRendered]);
  return rendered;
};
