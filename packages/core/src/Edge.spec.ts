import { beforeEach, describe, expect, it, test } from 'vitest';

import { registerDefault } from './register-default.js';
registerDefault();

import type { EdgeTargetTuple } from '@ts-graphviz/common';
import { DotObject } from './DotObject.js';
import { Edge } from './Edge.js';
import { Node } from './Node.js';

let edge: Edge;

const targets = [...Array(2)].map(
  (_, i) => new Node(`node${i + 1}`),
) as unknown as EdgeTargetTuple;

beforeEach(() => {
  edge = new Edge(targets);
});

it('should be instance of Edge/DotObject', () => {
  expect(edge).toBeInstanceOf(Edge);
  expect(edge).toBeInstanceOf(DotObject);
});

describe('Constructor', () => {
  test('first argument is targets, and second attributes object', () => {
    edge = new Edge(targets, {
      label: 'Label',
    });
    expect(edge.attributes.size).toBe(1);
    expect(edge.attributes.get('label')).toBe('Label');
  });
});

it('throws an error when the EdgeTarget element is missing', () => {
  const n = new Node('id');
  expect(
    () => new Edge([] as unknown as EdgeTargetTuple),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: The element of Edge target is missing or not satisfied as Edge target.]`,
  );
  expect(
    () => new Edge([n] as unknown as EdgeTargetTuple),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: The element of Edge target is missing or not satisfied as Edge target.]`,
  );
});
