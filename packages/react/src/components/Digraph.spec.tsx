import { describe, expect, test } from 'vitest';
import { render } from '../render.js';
import { Digraph } from './Digraph.js';

describe('Digraph', () => {
  test('An error occurs when duplicate <Digraph />', () => {
    expect(() => {
      render(
        <Digraph>
          <Digraph />
        </Digraph>,
      );
    }).toThrowErrorMatchingInlineSnapshot(`
      [Error: RootCluster is duplicated.
      Use only one of Digraph and Graph.]
    `);
  });
});
