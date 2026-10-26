import { stringify } from '@ts-graphviz/ast';
import { isTsGraphvizError, withCode } from '@ts-graphviz/common';
import { Digraph, Node, OrderedDigraph } from '@ts-graphviz/core';
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

describe('[SM-8] lookups read own properties only', () => {
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

  it('GraphBase.with takes only the classes it is given', () => {
    class Extra extends Node {}
    const g = new Digraph();
    withInherited('Node', Extra, () => g.with({}));
    expect(g.createNode('a')).not.toBeInstanceOf(Extra);
    // Whether the context is complete or not, it inherits nothing.
    const { models } = g as unknown as { models: object };
    expect(Object.getPrototypeOf(models)).toBeNull();
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
    for (const g of [new Digraph(), new OrderedDigraph()]) {
      // The ordered graph keeps a list in place once it has a statement.
      g.createNode('a');
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
