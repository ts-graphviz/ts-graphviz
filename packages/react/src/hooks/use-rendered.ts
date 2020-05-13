import { useState, useEffect, useMemo } from 'react';

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
  const graphviz = useMemo(() => import('@hpcc-js/wasm').then(wasm => wasm.graphviz), []);
  useEffect(() => {
    graphviz.then(gv => gv.layout(dot, format, engine, ext)).then(setRendered);
  }, [dot, engine, format, ext, setRendered, graphviz]);
  return rendered;
};
