import { expect, it, test } from 'vitest';
import { Digraph } from './Digraph.js';
import { GraphBase } from './GraphBase.js';
import { registerDefault } from './register-default.js';
registerDefault();

const g = new Digraph();

test('directed propaty should be true', () => {
  expect(g.directed).toStrictEqual(true);
});

it('should be instance of Digraph/GraphBase', () => {
  expect(g).toBeInstanceOf(Digraph);
  expect(g).toBeInstanceOf(GraphBase);
});
