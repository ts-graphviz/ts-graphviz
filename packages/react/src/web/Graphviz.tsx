/* eslint-disable react/prop-types */
import React, { FC, ReactElement, useRef, useMemo, useEffect } from 'react';
import { graphviz } from '@hpcc-js/wasm';
import { renderToDot } from '../renderer/render';

type Engine = 'circo' | 'dot' | 'fdp' | 'neato' | 'osage' | 'patchwork' | 'twopi';
interface Image {
  path: string;
  width: string;
  height: string;
}
interface File {
  path: string;
  data: string;
}

type Props = {
  children: ReactElement;
  engine?: Engine;
  images?: Image[];
  files?: File[];
};

export const Graphviz: FC<Props> = ({ children, engine, images, files }) => {
  const ref = useRef<HTMLDivElement>(null);
  const dot = useMemo(() => renderToDot(children), [children]);
  useEffect(() => {
    const render = async (): Promise<void> => {
      const result = await graphviz.layout(dot, 'svg', engine, { images, files });
      if (ref.current) {
        ref.current.innerHTML = result;
      }
    };
    render();
  }, [dot, engine, images, files]);
  return <div ref={ref} />;
};

Graphviz.defaultProps = {
  images: [],
  files: [],
};
