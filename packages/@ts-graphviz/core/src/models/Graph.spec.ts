import { it, test, expect } from 'vitest';

import './registerModelContext.js';
import { Graph } from './Graph.js';
import { GraphBase } from './GraphBase.js';
import { DotObject } from './DotObject.js';
import { isDirected } from '@ts-graphviz/common';

const g = new Graph();

test('directed propaty should be false', () => {
  expect(isDirected(g)).toBe(false);
});

it('should be instance of Graph/GraphBase/DotObject', () => {
  expect(g).toBeInstanceOf(Graph);
  expect(g).toBeInstanceOf(GraphBase);
  expect(g).toBeInstanceOf(DotObject);
});
