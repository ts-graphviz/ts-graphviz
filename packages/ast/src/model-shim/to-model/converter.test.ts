import { defaultModelsContext } from '@ts-graphviz/core';
import { describe, expect, it } from 'vitest';
import { createElement } from '../../builder/create-element.js';
import { ToModelConverter } from './converter.js';
import { toModel } from './to-model.js';
import type { ToModelConvertableASTNode } from './types.js';

const literal = <T extends string>(value: T) =>
  createElement('Literal', { value, kind: 'bare' }, []);

describe('toModel without a plugin for a node', { tags: ['SM-5'] }, () => {
  it.each([
    [
      'Attribute',
      createElement(
        'Attribute',
        { key: literal('label'), value: literal('b') },
        [],
      ),
    ],
    ['Literal', literal('a')],
    ['Unknown', { type: 'Unknown', children: [] }],
  ])('throws TSG_ERR_NO_PLUGIN for a %s node', (_, ast) => {
    // Outside the types: these nodes have no model.
    const node = ast as unknown as ToModelConvertableASTNode;
    const options = { models: defaultModelsContext() };
    expect(() => toModel(node, options)).toThrow(
      expect.objectContaining({ name: 'Error', code: 'TSG_ERR_NO_PLUGIN' }),
    );
    expect(() => new ToModelConverter(options).convert(node)).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_NO_PLUGIN' }),
    );
  });
});
