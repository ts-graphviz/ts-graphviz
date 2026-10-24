import { GraphvizProvider } from '@site/src/contexts/Graphviz';
import { ContainerProvider } from '@site/src/contexts/WebContainer';
import type { JSX, ReactNode } from 'react';

const Root = ({ children }: { children: ReactNode }): JSX.Element => {
  return (
    <ContainerProvider>
      <GraphvizProvider>{children}</GraphvizProvider>
    </ContainerProvider>
  );
};

export default Root;
