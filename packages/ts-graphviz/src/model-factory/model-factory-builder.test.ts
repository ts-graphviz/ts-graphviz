import { vi, describe, expect, test } from 'vitest';
import '@ts-graphviz/core';

import { RootModelsContext, isDirected } from '@ts-graphviz/common';
import { attribute as _ } from '../attribute.js';
import { ModelFactoryBuilder } from './model-factory-builder.js';

describe.each([
  { directed: true, strict: true },
  { directed: false, strict: true },
  { directed: false, strict: false },
  { directed: true, strict: false },
])('strict: %s, directed: %s', ({ strict, directed }) => {
  const factory = ModelFactoryBuilder.call(RootModelsContext, directed, strict);

  test('no arguments', () => {
    const g = factory();
    expect(isDirected(g)).toStrictEqual(directed);
    expect(g.strict).toStrictEqual(strict);
  });

  test('first argument is id', () => {
    const g = factory('foo');
    expect(g.id).toBe('foo');

    expect(isDirected(g)).toStrictEqual(directed);
    expect(g.strict).toStrictEqual(strict);
  });

  test('first argument is callback', () => {
    const callback = vi.fn();
    const g = factory(callback);
    expect(g.id).toBeUndefined();
    expect(callback).toHaveBeenCalledWith(g);

    expect(isDirected(g)).toStrictEqual(directed);
    expect(g.strict).toStrictEqual(strict);
  });

  test('first argument is attribute object', () => {
    const g = factory({ [_.label]: 'Test label' });
    expect(g.id).toBeUndefined();
    expect(g.values).toStrictEqual([[_.label, 'Test label']]);

    expect(isDirected(g)).toStrictEqual(directed);
    expect(g.strict).toStrictEqual(strict);
  });

  test('first argument is attribute object, seccond argument is callback', () => {
    const callback = vi.fn();
    const g = factory({ [_.label]: 'Test label' }, callback);
    expect(g.id).toBeUndefined();
    expect(g.values).toStrictEqual([[_.label, 'Test label']]);
    expect(callback).toHaveBeenCalledWith(g);

    expect(isDirected(g)).toStrictEqual(directed);
    expect(g.strict).toStrictEqual(strict);
  });

  test('first argument is id, seccond argument is attribute object', () => {
    const g = factory('foo', { [_.label]: 'Test label' });
    expect(g.id).toBe('foo');
    expect(g.values).toStrictEqual([[_.label, 'Test label']]);

    expect(isDirected(g)).toStrictEqual(directed);
    expect(g.strict).toStrictEqual(strict);
  });

  test('first argument is id, seccond argument is attribute object, third arguments is callback', () => {
    const callback = vi.fn();
    const g = factory('foo', { [_.label]: 'Test label' }, callback);
    expect(g.id).toBe('foo');
    expect(g.values).toStrictEqual([[_.label, 'Test label']]);
    expect(callback).toHaveBeenCalledWith(g);

    expect(isDirected(g)).toStrictEqual(directed);
    expect(g.strict).toStrictEqual(strict);
  });
});