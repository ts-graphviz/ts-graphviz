import type { ReactNode } from 'react';

export default function CodeBlock({
  children,
  language,
}: {
  children: ReactNode;
  language?: string;
  className?: string;
}) {
  return (
    <pre data-language={language}>
      <code>{children}</code>
    </pre>
  );
}
