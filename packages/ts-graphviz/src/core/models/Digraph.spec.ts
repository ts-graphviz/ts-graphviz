import { expect, it, test } from 'vitest';
import { Digraph } from './Digraph.js';
import { DotObject } from './DotObject.js';
import { GraphBase } from './GraphBase.js';
import './registerModelContext.js';

const g = new Digraph();

test('directed propaty should be true', () => {
  expect(g.directed).toStrictEqual(true);
});

it('should be instance of Digraph/GraphBase/DotObject', () => {
  expect(g).toBeInstanceOf(Digraph);
  expect(g).toBeInstanceOf(GraphBase);
  expect(g).toBeInstanceOf(DotObject);
});
