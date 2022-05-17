import React, { FC, useMemo, ReactElement } from 'react';
import { renderToDot } from '../renderer/render';
import { useRendered, Engine, Image, File } from '../hooks/use-rendered';

type Props = {
  children: ReactElement;
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
  // eslint-disable-next-line react/no-danger
  return <div dangerouslySetInnerHTML={svg} />;
};

Graphviz.defaultProps = {
  engine: undefined,
  images: [],
  files: [],
};
