import { afterEach } from 'vitest';

// Component tests opt into jsdom with `// @vitest-environment jsdom`.
if (typeof window !== 'undefined') {
  const { cleanup } = await import('@testing-library/react');
  afterEach(cleanup);
}
