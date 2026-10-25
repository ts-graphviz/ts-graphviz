import { translate } from '@docusaurus/Translate';
import type { Engine } from '@hpcc-js/wasm-graphviz';
import { useGraphviz, useGraphvizSVG } from '@site/src/contexts/Graphviz';
import { type ReactNode, useEffect, useMemo } from 'react';

interface GraphvizProps {
  /**
   * A string containing a graph representation using the Graphviz DOT language.
   * @see https://graphviz.org/doc/info/lang.html
   */
  dot: string | null;
  engine?: Engine;
  /**
   * The classname to attach to this component for styling purposes.
   */
  className?: string;
}

/**
 * Lay out `dot` with Graphviz (WASM) and show it as an image.
 * Needs a GraphvizProvider above it.
 */
const Graphviz = ({ dot, engine = 'dot', className }: GraphvizProps) => {
  const graphviz = useGraphviz();
  const { svg, error } = useGraphvizSVG(dot, engine);
  // An <img> keeps any script or link in the SVG inert.
  const url = useMemo(
    () =>
      svg === null
        ? null
        : URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })),
    [svg],
  );
  useEffect(() => {
    if (url === null) return;
    return () => URL.revokeObjectURL(url);
  }, [url]);

  let content: ReactNode = null;
  if (graphviz.status === 'error') {
    content = (
      <p role="alert">
        {translate(
          { message: 'Failed to load Graphviz: {message}' },
          { message: graphviz.error.message },
        )}
      </p>
    );
  } else if (graphviz.status === 'loading') {
    content = <output>{translate({ message: 'Loading Graphviz…' })}</output>;
  } else if (error) {
    content = (
      <p role="alert">
        {translate(
          { message: 'Failed to render graph: {message}' },
          { message: error.message },
        )}
      </p>
    );
  } else if (url) {
    content = <img src={url} alt={translate({ message: 'Rendered graph' })} />;
  }
  return <div className={className}>{content}</div>;
};

export { Graphviz, type GraphvizProps };
