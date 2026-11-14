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
    expect(callback).toHaveBeenCalledWith(g, defaultModelKit);

    expect(modelOf(g).directed).toStrictEqual(directed);
    expect(modelOf(g).strict).toStrictEqual(strict);
  });

  test('first argument is attribute object', () => {
    const g = factory({ [_.label]: 'Test label' });
    expect(modelOf(g).id).toBeUndefined();
    expect({ ...g }).toStrictEqual({ [_.label]: 'Test label' });

    expect(modelOf(g).directed).toStrictEqual(directed);
    expect(modelOf(g).strict).toStrictEqual(strict);
  });

  test('first argument is attribute object, seccond argument is callback', () => {
    const callback = vi.fn();
    const g = factory({ [_.label]: 'Test label' }, callback);
    expect(modelOf(g).id).toBeUndefined();
    expect({ ...g }).toStrictEqual({ [_.label]: 'Test label' });
    expect(callback).toHaveBeenCalledWith(g, defaultModelKit);

    expect(modelOf(g).directed).toStrictEqual(directed);
    expect(modelOf(g).strict).toStrictEqual(strict);
  });

  test('first argument is id, seccond argument is attribute object', () => {
    const g = factory('foo', { [_.label]: 'Test label' });
    expect(modelOf(g).id).toStrictEqual('foo');
    expect({ ...g }).toStrictEqual({ [_.label]: 'Test label' });

    expect(modelOf(g).directed).toStrictEqual(directed);
    expect(modelOf(g).strict).toStrictEqual(strict);
  });

  test('first argument is id, seccond argument is attribute object, third arguments is callback', () => {
    const callback = vi.fn();
    const g = factory('foo', { [_.label]: 'Test label' }, callback);
    expect(modelOf(g).id).toStrictEqual('foo');
    expect({ ...g }).toStrictEqual({ [_.label]: 'Test label' });
    expect(callback).toHaveBeenCalledWith(g, defaultModelKit);

    expect(modelOf(g).directed).toStrictEqual(directed);
    expect(modelOf(g).strict).toStrictEqual(strict);
  });
});
