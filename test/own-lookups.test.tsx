import { stringify } from '@ts-graphviz/ast';
import { isTsGraphvizError, withCode } from '@ts-graphviz/common';
import {
  createModelKit,
  Digraph,
  defaultModelKit,
  LegacyDigraph,
  Node,
} from '@ts-graphviz/core';
import { renderHTMLLike } from '@ts-graphviz/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';

/** Runs `fn` with `Object.prototype[key]` set to `value`. */
function withInherited<T>(key: string, value: unknown, fn: () => T): T {
  const proto = Object.prototype as Record<string, unknown>;
  proto[key] = value;
  try {
    return fn();
  } finally {
    delete proto[key];
  }
}

describe('lookups read own properties only', { tags: ['SM-8'] }, () => {
  it('isTsGraphvizError needs a code of its own', () => {
    const plain = { message: 'm', name: 'Error' };
    expect(
      withInherited('code', 'TSG_ERR_DOT_SYNTAX', () =>
        isTsGraphvizError(plain),
      ),
    ).toBe(false);
    expect(
      isTsGraphvizError(withCode(new Error('m'), 'TSG_ERR_DOT_SYNTAX')),
    ).toBe(true);
  });

  it('createModelKit takes only the classes it is given', () => {
    class Extra extends Node {}
    const kit = withInherited('Node', Extra, () => createModelKit({}));
    expect(kit.createNode('a')).not.toBeInstanceOf(Extra);
  });

  it('renderHTMLLike knows only its own element names', () => {
    expect(() =>
      withInherited('dot:extra', 'table', () =>
        renderHTMLLike(createElement('dot:extra' as never)),
      ),
    ).toThrow(TypeError);
  });
});

describe('attribute list kinds', () => {
  const coded = expect.objectContaining({
    name: 'TypeError',
    code: 'TSG_ERR_INVALID_ATTRIBUTE_LIST_KIND',
  });

  it('addAttributeList takes only Graph, Node and Edge', () => {
    for (const g of [new Digraph(), new LegacyDigraph()]) {
      // The ordered graph keeps a list in place once it has a statement.
      g.addNode(defaultModelKit.createNode('a'));
      expect(() =>
        g.addAttributeList('node []; extra [label="x"]; node' as never, {}),
      ).toThrow(coded);
      g.addAttributeList('Node', { shape: 'box' });
    }
  });

  it('stringify prints only Graph, Node and Edge lists', () => {
    const ast = {
      type: 'AttributeList',
      kind: 'node []; extra [label="x"]; node',
      children: [],
    };
    expect(() => stringify(ast as never)).toThrow(coded);
    expect(
      stringify({ type: 'AttributeList', kind: 'Node', children: [] } as never),
    ).toBe('node [];');
  });
});
