import { translate } from '@docusaurus/Translate';
import type { Engine } from '@hpcc-js/wasm-graphviz';
import { useEffect, useState } from 'react';

import { useGraphviz } from '@site/src/contexts/Graphviz';

interface GraphvizProps {
  /**
   * A string containing a graph representation using the Graphviz DOT language.
   * @see https://graphviz.org/doc/info/lang.html
   */
  dot: string;
  engine?: Engine;
  /**
   * The classname to attach to this component for styling purposes.
   */
  className?: string;
}

const Graphviz = ({ dot, engine, className }: GraphvizProps) => {
  const graphviz = useGraphviz();
  const [url, setUrl] = useState<string>(null);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    if (dot && graphviz.status === 'ready') {
      setError(null);
      try {
        const svg = graphviz.renderToSVG(dot, engine);
        const newUrl = URL.createObjectURL(
          new Blob([svg], { type: 'image/svg+xml' }),
        );
        setUrl(newUrl);
        return () => URL.revokeObjectURL(newUrl);
      } catch (e) {
        setError(e);
      }
    }
  }, [graphviz, dot, engine, setUrl, setError]);
  return (
    <div className={className}>
      {error ? (
        <div className="error">
          {translate(
            {
              message: 'Failed to render graph: {message}',
            },
            { message: error.message },
          )}
        </div>
      ) : graphviz.status !== 'ready' ? (
        <div className="loading">
          {translate(
            {
              message: 'Loading...',
            },
            { message: error.message },
          )}
        </div>
      ) : url ? (
        <img src={url} alt={`Graph visualization: ${dot.slice(0, 50)}...`} />
      ) : null}
    </div>
  );
};

export { Graphviz, type GraphvizProps };
