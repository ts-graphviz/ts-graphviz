import { createRef } from 'react';
import type { EdgeModel, RootGraphModel } from 'ts-graphviz';
import { describe, expect, test } from 'vitest';
import { render } from '../render.js';
import { Digraph } from './Digraph.js';
import { Edge } from './Edge.js';
import { Node } from './Node.js';

describe('Edge', () => {
  describe('ref support', () => {
    test('should provide access to EdgeModel via ref', async () => {
      const edgeRef = createRef<EdgeModel>();

      await render<RootGraphModel>(
        <Digraph>
          <Node id="A" />
          <Node id="B" />
          <Edge targets={['A', 'B']} ref={edgeRef} label="Test Edge" />
        </Digraph>,
      );

      expect(edgeRef.current).not.toBeNull();
      expect(edgeRef.current?.targets).toHaveLength(2);
      expect(edgeRef.current?.targets[0]).toMatchObject({ id: 'A' });
      expect(edgeRef.current?.targets[1]).toMatchObject({ id: 'B' });
    });
  });
});
