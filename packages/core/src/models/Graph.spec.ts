import { expect, it, test } from 'vitest';
import { DotObject } from './DotObject.js';
import { Graph } from './Graph.js';
import { GraphBase } from './GraphBase.js';

import './registerModelContext.js';

const g = new Graph();

test('directed propaty should be false', () => {
  expect(g.directed).toStrictEqual(false);
});

it('should be instance of Graph/GraphBase/DotObject', () => {
  expect(g).toBeInstanceOf(Graph);
  expect(g).toBeInstanceOf(GraphBase);
  expect(g).toBeInstanceOf(DotObject);
});
