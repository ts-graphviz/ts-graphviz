import { describe, expect, test } from 'vitest';
import { render } from '../render.js';
import { Graph } from './Graph.js';

describe('Graph', () => {
  test('An error occurs when duplicate <Graph />', () => {
    expect(() => {
      render(
        <Graph>
          <Graph />
        </Graph>,
      );
    }).toThrowErrorMatchingInlineSnapshot(`
      [Error: RootCluster is duplicated.
      Use only one of Digraph and Graph.]
    `);
  });
});
