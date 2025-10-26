/// <reference types="vite/client" />

import type { DotJSXElements } from '@ts-graphviz/react/jsx';

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements extends DotJSXElements {}
  }
}
