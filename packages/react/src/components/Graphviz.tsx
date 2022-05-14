/* eslint-disable react/no-danger */
/* eslint-disable react/prop-types */
import React, { FC, useMemo, ReactElement } from 'react';
import { renderToDot } from '../renderer/render';
import { useRendered, Engine, Image, File } from '../hooks/use-rendered';

type Props = {
  children: ReactElement;
  // TODO
  // eslint-disable-next-line react/require-default-props
  engine?: Engine;
  images?: Image[];
  files?: File[];
};

/**
 * Web only
 */
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
