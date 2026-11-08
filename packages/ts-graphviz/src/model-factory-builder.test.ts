import { defaultModelsContext } from '@ts-graphviz/core';
import { describe, expect, test, vi } from 'vitest';

import { attribute as _ } from './attribute.js';
import { ModelFactoryBuilder } from './model-factory-builder.js';

describe.each([
  { directed: true, strict: true },
  { directed: false, strict: true },
  { directed: false, strict: false },
  { directed: true, strict: false },
])('strict: %s, directed: %s', ({ strict, directed }) => {
  const factory = ModelFactoryBuilder.call(
    defaultModelsContext(),
    directed,
    strict,
  );

  test('no arguments', () => {
    const g = factory();
    expect(g.directed).toStrictEqual(directed);
    expect(g.strict).toStrictEqual(strict);
  });

  test('first argument is id', () => {
    const g = factory('foo');
    expect(g.graphId).toStrictEqual('foo');

    expect(g.directed).toStrictEqual(directed);
    expect(g.strict).toStrictEqual(strict);
  });

  test('first argument is callback', () => {
    const callback = vi.fn();
    const g = factory(callback);
    expect(g.graphId).toBeUndefined();
    expect(callback).toHaveBeenCalledWith(g);

    expect(g.directed).toStrictEqual(directed);
    expect(g.strict).toStrictEqual(strict);
  });

  test('first argument is attribute object', () => {
    const g = factory({ [_.label]: 'Test label' });
    expect(g.graphId).toBeUndefined();
    expect(g.getAttributeNames()).toStrictEqual([_.label]);
    expect(g.getAttribute(_.label)).toBe('Test label');

    expect(g.directed).toStrictEqual(directed);
    expect(g.strict).toStrictEqual(strict);
  });

  test('first argument is attribute object, seccond argument is callback', () => {
    const callback = vi.fn();
    const g = factory({ [_.label]: 'Test label' }, callback);
    expect(g.graphId).toBeUndefined();
    expect(g.getAttributeNames()).toStrictEqual([_.label]);
    expect(g.getAttribute(_.label)).toBe('Test label');
    expect(callback).toHaveBeenCalledWith(g);

    expect(g.directed).toStrictEqual(directed);
    expect(g.strict).toStrictEqual(strict);
  });

  test('first argument is id, seccond argument is attribute object', () => {
    const g = factory('foo', { [_.label]: 'Test label' });
    expect(g.graphId).toStrictEqual('foo');
    expect(g.getAttributeNames()).toStrictEqual([_.label]);
    expect(g.getAttribute(_.label)).toBe('Test label');

    expect(g.directed).toStrictEqual(directed);
    expect(g.strict).toStrictEqual(strict);
  });

  test('first argument is id, seccond argument is attribute object, third arguments is callback', () => {
    const callback = vi.fn();
    const g = factory('foo', { [_.label]: 'Test label' }, callback);
    expect(g.graphId).toStrictEqual('foo');
    expect(g.getAttributeNames()).toStrictEqual([_.label]);
    expect(g.getAttribute(_.label)).toBe('Test label');
    expect(callback).toHaveBeenCalledWith(g);

    expect(g.directed).toStrictEqual(directed);
    expect(g.strict).toStrictEqual(strict);
  });
});
