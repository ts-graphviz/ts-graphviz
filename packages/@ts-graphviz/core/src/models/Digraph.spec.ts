import { it, test, expect } from 'vitest';

import './registerModelContext.js';
import { Digraph } from './Digraph.js';
import { GraphBase } from './GraphBase.js';
import { DotObject } from './DotObject.js';

const g = new Digraph();

test('directed propaty should be true', () => {
  expect(g.directed).toBe(true);
});

it('should be instance of Digraph/GraphBase/DotObject', () => {
  expect(g).toBeInstanceOf(Digraph);
  expect(g).toBeInstanceOf(GraphBase);
  expect(g).toBeInstanceOf(DotObject);
});
