import { translate } from '@docusaurus/Translate';
import { useEffect, useState } from 'react';

interface GraphImageProps {
  /** SVG made by Graphviz. */
  svg: string;
  /**
   * The classname to attach to this component for styling purposes.
   */
  className?: string;
}

/**
 * Show an SVG made by Graphviz as an image. An <img> keeps any script or
 * link in the SVG inert.
 */
const GraphImage = ({ svg, className }: GraphImageProps) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(
      new Blob([svg], { type: 'image/svg+xml' }),
    );
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [svg]);
  return (
    <div className={className}>
      {url ? (
        <img src={url} alt={translate({ message: 'Rendered graph' })} />
      ) : null}
    </div>
  );
};

export { GraphImage, type GraphImageProps };
