import { registerDefault } from '@ts-graphviz/core';
import { describe, expect, test } from 'vitest';
import { createElement } from '../../builder/create-element.js';
import { toModel } from './to-model.js';
registerDefault();

test('brank ast throw error', () => {
  const ast = createElement('Dot', {}, []);

  expect(() => toModel(ast)).toThrow();
});

test('comment', () => {
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
  expect(model.comment).toStrictEqual('This is comment');
});

describe('HTML Lavel', () => {
  test('node label', () => {
    const ast = createElement(
      'Node',
      {
        id: createElement('Literal', { value: 'A', quoted: false }),
      },
      [
        createElement('Attribute', {
          key: createElement('Literal', { value: 'label', quoted: false }),
          value: createElement('Literal', { value: 'A', quoted: 'html' }),
        }),
      ],
    );

    const model = toModel(ast);
    expect(model.id).toStrictEqual('A');
    expect(model.attributes.get('label')).toStrictEqual('<A>');
  });

  test('edge label', () => {
    const ast = createElement(
      'Edge',
      {
        targets: [
          createElement('NodeRef', {
            id: createElement('Literal', { value: 'A', quoted: false }),
          }),
          createElement('NodeRef', {
            id: createElement('Literal', { value: 'B', quoted: false }),
          }),
        ],
      },
      [
        createElement('Attribute', {
          key: createElement('Literal', { value: 'label', quoted: false }),
          value: createElement('Literal', { value: 'A', quoted: 'html' }),
        }),
      ],
    );

    const model = toModel(ast);
    expect(model.attributes.get('label')).toStrictEqual('<A>');
  });
});
