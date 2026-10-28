import type { DotObjectModel } from '@ts-graphviz/common';
import { describe, expect, it } from 'vitest';
import { FromModelConverter } from './converter.js';
import { fromModel } from './from-model.js';

describe('fromModel without a plugin for a model', { tags: ['SM-5'] }, () => {
  it.each([
    ['an unknown $$type', { $$type: 'Unknown' }],
    ['no $$type', {}],
  ])('throws TSG_ERR_NO_PLUGIN for a model with %s', (_, value) => {
    // Outside the types: every DotObjectModel has a plugin.
    const model = value as unknown as DotObjectModel;
    expect(() => fromModel(model)).toThrow(
      expect.objectContaining({ name: 'Error', code: 'TSG_ERR_NO_PLUGIN' }),
    );
    expect(() => new FromModelConverter().convert(model)).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_NO_PLUGIN' }),
    );
  });
});
