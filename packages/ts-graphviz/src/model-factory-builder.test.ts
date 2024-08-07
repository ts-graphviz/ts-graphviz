import { describe, expect, test, vi } from 'vitest';

import { RootModelsContext } from '@ts-graphviz/common';
import { registerDefault } from '@ts-graphviz/core';
registerDefault();
import { attribute as _ } from './attribute.js';
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
    expect(g.directed).toStrictEqual(directed);
    expect(g.strict).toStrictEqual(strict);
  });

  test('first argument is id', () => {
    const g = factory('foo');
    expect(g.id).toStrictEqual('foo');

    expect(g.directed).toStrictEqual(directed);
    expect(g.strict).toStrictEqual(strict);
  });

  test('first argument is callback', () => {
    const callback = vi.fn();
    const g = factory(callback);
    expect(g.id).toBeUndefined();
    expect(callback).toHaveBeenCalledWith(g);

    expect(g.directed).toStrictEqual(directed);
    expect(g.strict).toStrictEqual(strict);
  });

  test('first argument is attribute object', () => {
    const g = factory({ [_.label]: 'Test label' });
    expect(g.id).toBeUndefined();
    expect(g.values).toStrictEqual([[_.label, 'Test label']]);

    expect(g.directed).toStrictEqual(directed);
    expect(g.strict).toStrictEqual(strict);
  });

  test('first argument is attribute object, seccond argument is callback', () => {
    const callback = vi.fn();
    const g = factory({ [_.label]: 'Test label' }, callback);
    expect(g.id).toBeUndefined();
    expect(g.values).toStrictEqual([[_.label, 'Test label']]);
    expect(callback).toHaveBeenCalledWith(g);

    expect(g.directed).toStrictEqual(directed);
    expect(g.strict).toStrictEqual(strict);
  });

  test('first argument is id, seccond argument is attribute object', () => {
    const g = factory('foo', { [_.label]: 'Test label' });
    expect(g.id).toStrictEqual('foo');
    expect(g.values).toStrictEqual([[_.label, 'Test label']]);

    expect(g.directed).toStrictEqual(directed);
    expect(g.strict).toStrictEqual(strict);
  });

  test('first argument is id, seccond argument is attribute object, third arguments is callback', () => {
    const callback = vi.fn();
    const g = factory('foo', { [_.label]: 'Test label' }, callback);
    expect(g.id).toStrictEqual('foo');
    expect(g.values).toStrictEqual([[_.label, 'Test label']]);
    expect(callback).toHaveBeenCalledWith(g);

    expect(g.directed).toStrictEqual(directed);
    expect(g.strict).toStrictEqual(strict);
  });
});
