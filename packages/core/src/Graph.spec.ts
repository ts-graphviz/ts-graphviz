import { expect, it, test } from 'vitest';
import { Graph } from './Graph.js';
import { GraphBase } from './GraphBase.js';

import { registerDefault } from './register-default.js';
registerDefault();

const g = new Graph();

test('directed propaty should be false', () => {
  expect(g.directed).toStrictEqual(false);
});

it('should be instance of Graph/GraphBase', () => {
  expect(g).toBeInstanceOf(Graph);
  expect(g).toBeInstanceOf(GraphBase);
});
