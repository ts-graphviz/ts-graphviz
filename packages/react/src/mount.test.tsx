import type { ReactElement } from 'react';
import {
  createModelKit,
  Digraph as DigraphModel,
  Subgraph as SubgraphModel,
} from 'ts-graphviz';
import { afterEach, describe, expect, it } from 'vitest';
import { GraphPortal } from './components/GraphPortal.js';
import { Node } from './components/Node.js';
import { Subgraph } from './components/Subgraph.js';
import { Mount, type MountHandlers } from './mount.js';
import type { AddedStatements } from './shared/tree.js';

const errors: unknown[] = [];
const report = (error: unknown): void => {
  errors.push(error);
};
const handlers: MountHandlers = {
  onUncaughtError: report,
  onCaughtError: report,
  onRecoverableError: report,
  onModelError: report,
  onCommit: () => {},
  onFailure: report,
};

afterEach(() => {
  expect(errors.splice(0)).toEqual([]);
});

describe('what a mount remembers of the graphs it added to', () => {
  const mountOn = (container: DigraphModel) => {
    const added: AddedStatements = new Map();
    const mount = new Mount(
      { container, models: createModelKit({}) },
      handlers,
      added,
    );
    return { added, mount };
  };
  const cluster = (id: string): ReactElement => (
    <Subgraph key={id} id={id}>
      <Node id="n" />
    </Subgraph>
  );

  it('is the graphs of the tree as it is, however many it had before', () => {
    const container = new DigraphModel();
    const { added, mount } = mountOn(container);
    for (let i = 0; i < 5; i++) {
      mount.renderSync(cluster(`s${i}`));
      expect([...added.keys()]).toEqual([container, container.subgraphs[0]]);
    }
    mount.discard(true);
  });

  it('a subgraph that left the tree keeps what it shows', () => {
    const container = new DigraphModel();
    const { mount } = mountOn(container);
    mount.renderSync(cluster('first'));
    const [first] = container.subgraphs;
    mount.renderSync(cluster('second'));
    expect(container.subgraphs.map((s) => s.id)).toEqual(['second']);
    expect(first.nodes.map((n) => n.id)).toEqual(['n']);
    mount.discard(true);
  });

  it('is nothing after the mount was discarded', () => {
    const container = new DigraphModel();
    const { added, mount } = mountOn(container);
    mount.renderSync(cluster('s'));
    mount.discard(true);
    expect(added.size).toBe(0);
    expect(container.subgraphs).toHaveLength(0);
  });

  it("a graph of the container's that no portal names any more is forgotten", () => {
    const container = new DigraphModel();
    const own = new SubgraphModel('own');
    container.addSubgraph(own);
    const { added, mount } = mountOn(container);
    mount.renderSync(
      <GraphPortal id="own">
        <Node id="n" />
      </GraphPortal>,
    );
    expect(own.nodes.map((n) => n.id)).toEqual(['n']);
    mount.renderSync(<Node id="n" />);
    expect(own.nodes).toHaveLength(0);
    expect([...added.keys()]).toEqual([container]);
    mount.discard(true);
  });
});
