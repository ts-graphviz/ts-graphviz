import { test, expect } from 'vitest';
import '@ts-graphviz/core';
import { createElement } from '@ts-graphviz/ast';

import { toModel } from './to-model.js';

test('brank ast throw error', () => {
  const ast = createElement('Dot', {}, []);

  expect(() => toModel(ast)).toThrow();
});

test.skip('comment', () => {
  const ast = createElement('Dot', {}, [
    createElement(
      'Comment',
      {
        kind: 'Macro',
        value: 'This is comment',
      },
      [],
    ),
    createElement(
      'Graph',
      {
        strict: false,
        directed: true,
      },
      [],
    ),
  ]);
  const model = toModel(ast);
  expect(model.comment).toBe('This is comment');
});
