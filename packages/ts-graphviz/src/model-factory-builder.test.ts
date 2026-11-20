import { modelOf } from '@ts-graphviz/common';
import { defaultModelKit } from '@ts-graphviz/core';
import { describe, expect, test, vi } from 'vitest';

import { attribute as _ } from './attribute.js';
import { ModelFactoryBuilder } from './model-factory-builder.js';

describe.each([
  { directed: true, strict: true },
  { directed: false, strict: true },
  { directed: false, strict: false },
  { directed: true, strict: false },
])('strict: %s, directed: %s', ({ strict, directed }) => {
  const factory = ModelFactoryBuilder.call(defaultModelKit, directed, strict);

  test('no arguments', () => {
    const g = factory();
    expect(modelOf(g).directed).toStrictEqual(directed);
    expect(modelOf(g).strict).toStrictEqual(strict);
  });

  test('first argument is id', () => {
    const g = factory('foo');
    expect(modelOf(g).id).toStrictEqual('foo');

    expect(modelOf(g).directed).toStrictEqual(directed);
    expect(modelOf(g).strict).toStrictEqual(strict);
  });

  test('first argument is callback', () => {
    const callback = vi.fn();
    const g = factory(callback);
    expect(modelOf(g).id).toBeUndefined();
    expect(callback).toHaveBeenCalledWith(g);

    expect(modelOf(g).directed).toStrictEqual(directed);
    expect(modelOf(g).strict).toStrictEqual(strict);
  });

  test('takes undefined for an id left out', () => {
    const callback = vi.fn();
    const g = factory(undefined, callback);
    expect(modelOf(g).id).toBeUndefined();
    expect(callback).toHaveBeenCalledWith(g);
    expect(modelOf(g).strict).toStrictEqual(strict);
  });

  test("the callback writes the graph's attributes in its body", () => {
    const g = factory('foo', (g) => {
      g[_.label] = 'Test label';
    });
    expect(modelOf(g).getAttribute(_.label)).toBe('Test label');
    expect(modelOf(g).statements).toMatchObject([
      { key: 'label', value: 'Test label' },
    ]);
  });

  test.each([
    ['two ids', ['foo', 'bar']],
    ['a callback before the id', [() => {}, 'foo']],
    // 3.x's attributes argument: as in DOT, a graph takes none here.
    ['attributes', [{ label: 'x' }]],
    ['an id and attributes', ['foo', { label: 'x' }, () => {}]],
    ['a strict flag', ['foo', true]],
    ['too many arguments', ['foo', () => {}, undefined]],
  ])(
    'throws a TypeError with code TSG_ERR_INVALID_ARGUMENTS for %s',
    (_name, args) => {
      expect(() =>
        (factory as (...args: unknown[]) => unknown)(...args),
      ).toThrow(
        expect.objectContaining({
          name: 'TypeError',
          code: 'TSG_ERR_INVALID_ARGUMENTS',
          message: expect.stringContaining(directed ? 'digraph()' : 'graph()'),
        }),
      );
    },
  );
});
