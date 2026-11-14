import { type ReactNode, Suspense, use, useEffect, useState } from 'react';
import { Digraph as DigraphModel } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { Node } from './components/Node.js';
import { Subgraph } from './components/Subgraph.js';
import { fromElement } from './fromElement.js';

// React holds a fallback back for a while, and shows it when the data takes
// longer (about 300 ms). A conversion waits for the data either way. With
// the fallback shown React counts no work for the tree, and the waiting
// boundary is found in its fibers: these tests hold the fields read there.

const later = <T,>(value: T, ms: number): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

function Data({ data }: { data: Promise<string> }): ReactNode {
  return <Node id={use(data)} />;
}

const ids = (container: DigraphModel): string[] =>
  container.nodes.map((n) => n.id);

describe('fromElement waits for data under Suspense', () => {
  it.each([0, 100, 290, 310, 400, 700])('that takes %i ms', async (ms) => {
    const container = new DigraphModel();
    await fromElement(
      <Suspense fallback={<Node id="loading" />}>
        <Data data={later('loaded', ms)} />
      </Suspense>,
      { container },
    );
    expect(ids(container)).toEqual(['loaded']);
  });

  it('under several boundaries, each with its own wait', async () => {
    const container = new DigraphModel();
    await fromElement(
      <>
        <Suspense fallback={<Node id="loading a" />}>
          <Data data={later('a', 350)} />
        </Suspense>
        <Suspense fallback={<Node id="loading b" />}>
          <Data data={later('b', 500)} />
        </Suspense>
        <Suspense fallback={<Node id="loading c" />}>
          <Data data={later('c', 20)} />
        </Suspense>
      </>,
      { container },
    );
    expect(ids(container)).toEqual(['a', 'b', 'c']);
  });

  it('under a boundary inside another, and inside a graph', async () => {
    const container = new DigraphModel();
    await fromElement(
      <Suspense fallback={<Node id="loading outer" />}>
        <Data data={later('outer', 350)} />
        <Subgraph id="s">
          <Suspense fallback={<Node id="loading inner" />}>
            <Data data={later('inner', 450)} />
          </Suspense>
        </Subgraph>
      </Suspense>,
      { container },
    );
    expect(ids(container)).toEqual(['outer']);
    expect(container.getSubgraphs('s')[0]?.nodes.map((n) => n.id)).toEqual([
      'inner',
    ]);
  });

  it('that is read one after the other', async () => {
    const first = later('first', 350);
    const second = first.then(() => later('second', 350));
    const Both = (): ReactNode => (
      <>
        <Node id={use(first)} />
        <Node id={use(second)} />
      </>
    );
    const container = new DigraphModel();
    await fromElement(
      <Suspense fallback={<Node id="loading" />}>
        <Both />
      </Suspense>,
      { container },
    );
    expect(ids(container)).toEqual(['first', 'second']);
  });

  it('that a boundary starts to wait for after its content was shown', async () => {
    const data = later('loaded', 400);
    const Switches = (): ReactNode => {
      const [waits, setWaits] = useState(false);
      useEffect(() => setWaits(true), []);
      return <Node id={waits ? use(data) : 'shown'} />;
    };
    const container = new DigraphModel();
    await fromElement(
      <Suspense fallback={<Node id="loading" />}>
        <Switches />
      </Suspense>,
      { container },
    );
    expect(ids(container)).toEqual(['loaded']);
  });

  it('rejects with the error slow data rejects with', async () => {
    const failure = new Error('no data');
    const data = later(null, 400).then(() => Promise.reject(failure));
    const container = new DigraphModel();
    await expect(
      fromElement(
        <Suspense fallback={<Node id="loading" />}>
          <Data data={data} />
        </Suspense>,
        { container },
      ),
    ).rejects.toBe(failure);
    expect(ids(container)).toEqual([]);
  });

  it('rejects with the reason of the signal when the data never comes', async () => {
    const container = new DigraphModel();
    await expect(
      fromElement(
        <Suspense fallback={<Node id="loading" />}>
          <Data data={new Promise<string>(() => undefined)} />
        </Suspense>,
        { container, signal: AbortSignal.timeout(500) },
      ),
    ).rejects.toMatchObject({ name: 'TimeoutError' });
    expect(ids(container)).toEqual([]);
  });

  it('does not wait for what an effect starts by itself', async () => {
    const Fetches = (): ReactNode => {
      const [id, setId] = useState('initial');
      useEffect(() => {
        const timer = setTimeout(() => setId('fetched'), 50);
        return () => clearTimeout(timer);
      }, []);
      return <Node id={id} />;
    };
    const container = new DigraphModel();
    await fromElement(<Fetches />, { container });
    expect(ids(container)).toEqual(['initial']);
  });
});
