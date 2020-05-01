/* eslint-disable react/no-danger */
/* eslint-disable react/prop-types */
import React, { FC, ReactElement, useMemo } from 'react';
import { renderToDot } from '../../renderer/render';
import { useRendered, Engine, Image, File } from '../hooks/rendered';

type Props = {
  children: ReactElement;
  engine?: Engine;
  images?: Image[];
  files?: File[];
};

export const Graphviz: FC<Props> = ({ children, engine, images, files }) => {
  const dot = useMemo(() => renderToDot(children), [children]);
  const rendered = useRendered(dot, engine, 'svg', { images, files });
  const svg = useMemo((): { __html: string } | undefined => {
    if (rendered) {
      return {
        __html: rendered,
      };
    }
    return undefined;
  }, [rendered]);
  return <div dangerouslySetInnerHTML={svg} />;
};

Graphviz.defaultProps = {
  images: [],
  files: [],
};
