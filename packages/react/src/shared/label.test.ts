import { isHTMLLike } from '@ts-graphviz/common';
import { describe, expect, it } from 'vitest';
import {
  htmlLikeFromSource,
  htmlLikeFromTree,
  isConvertingLabel,
  isLabelProvider,
  type LabelNode,
  type LabelResolver,
  readLabelProvider,
  registerLabelProvider,
} from './label.js';

/** The markup of a label, between its angle brackets. */
const markup = (label: { value: string }): string => `<${label.value}>`;

describe('htmlLikeFromTree', () => {
  it('writes elements, attributes and text', () => {
    const label = htmlLikeFromTree({
      type: 'dot:table',
      props: { border: 0, fixedsize: true, cellpadding: null, hidden: false },
      children: [
        {
          type: 'tr',
          children: [
            { type: 'dot:td', props: { port: 'p' }, children: ['a ', 'b'] },
          ],
        },
        { type: 'dot:hr' },
      ],
    });
    expect(isHTMLLike(label)).toBe(true);
    expect(markup(label)).toBe(
      '<<table border="0" fixedsize><tr><td port="p">a b</td></tr><hr></hr></table>>',
    );
  });

  it('escapes text and attribute values', () => {
    expect(
      markup(
        htmlLikeFromTree({
          type: 'dot:font',
          props: { color: '"><b>&' },
          children: ['<b>&</b>'],
        }),
      ),
    ).toBe(
      '<<font color="&quot;&gt;&lt;b&gt;&amp;">&lt;b&gt;&amp;&lt;/b&gt;</font>>',
    );
  });

  it('refuses what is not an element of HTML-like labels', () => {
    expect(() => htmlLikeFromTree({ type: 'script' })).toThrow(
      new TypeError('<script> is not an element of HTML-like labels.'),
    );
    expect(() => htmlLikeFromTree({ type: 'constructor' })).toThrow(TypeError);
    expect(() => htmlLikeFromTree({ type: 'dot:port' })).toThrow(
      /set a port with the port attribute/,
    );
  });

  it('refuses an attribute name that is not a name', () => {
    expect(() =>
      htmlLikeFromTree({ type: 'dot:b', props: { 'a b="c"': 'x' } }),
    ).toThrow(TypeError);
  });

  it('refuses a node that is neither text nor an element', () => {
    expect(() => htmlLikeFromTree(1 as unknown as LabelNode)).toThrow(
      TypeError,
    );
    expect(() => htmlLikeFromTree({} as LabelNode)).toThrow(TypeError);
    expect(() =>
      htmlLikeFromTree(
        Object.create({ type: 'dot:b' }) as unknown as LabelNode,
      ),
    ).toThrow(TypeError);
  });

  it('refuses a tree deeper than the limit', () => {
    let label: LabelNode = 'x';
    for (let depth = 0; depth < 5; depth++) {
      label = { type: 'dot:b', children: [label] };
    }
    expect(markup(htmlLikeFromTree(label, 10))).toContain('x');
    expect(() => htmlLikeFromTree(label, 4)).toThrow(
      new RangeError(
        'Maximum rendering depth of 4 exceeded. This may indicate deeply nested or circular element structures.',
      ),
    );
    // Not a limit: the default applies.
    expect(markup(htmlLikeFromTree(label, 0))).toContain('x');
    expect(markup(htmlLikeFromTree(label, Number.NaN))).toContain('x');
  });

  it('refuses a tree that contains itself', () => {
    const children: LabelNode[] = [];
    const label: LabelNode = { type: 'dot:b', children };
    children.push(label);
    expect(() => htmlLikeFromTree(label)).toThrow(
      /^Circular reference detected/,
    );
    // The same node twice, side by side, is not a cycle.
    const cell: LabelNode = { type: 'dot:i', children: ['x'] };
    expect(
      markup(htmlLikeFromTree({ type: 'b', children: [cell, cell] })),
    ).toBe('<<b><i>x</i><i>x</i></b>>');
  });
});

describe('the providers of a label', () => {
  const provider = {};
  registerLabelProvider(provider, 'default');

  // A source of its own: ['provide', value, child], ['read'], or text.
  const resolve: LabelResolver = (source) => {
    if (typeof source === 'string') return { kind: 'text', text: source };
    const [kind, value, child] = source as [string, unknown?, unknown?];
    if (kind === 'provide') {
      return { kind: 'provider', provider, value, children: child };
    }
    if (kind === 'list') {
      return { kind: 'list', items: value as unknown[] };
    }
    return {
      kind: 'group',
      children: () => String(readLabelProvider(provider)),
    };
  };

  it('are known by the object registered', () => {
    expect(isLabelProvider(provider)).toBe(true);
    expect(isLabelProvider({})).toBe(false);
    expect(isLabelProvider('provider')).toBe(false);
    expect(isLabelProvider(null)).toBe(false);
  });

  it('give their value to what is below them, innermost first', () => {
    const source = [
      'list',
      [
        ['read'],
        ' ',
        [
          'provide',
          'outer',
          [
            'list',
            [['read'], ' ', ['provide', 'inner', ['read']], ' ', ['read']],
          ],
        ],
        ' ',
        ['read'],
      ],
    ];
    expect(markup(htmlLikeFromSource(source, resolve))).toBe(
      '<default outer inner outer default>',
    );
  });

  it('are those of the label being converted only', () => {
    expect(isConvertingLabel()).toBe(false);
    const nested: LabelResolver = (source) => {
      if (source === 'inner') {
        return {
          kind: 'group',
          children: () => htmlLikeFromSource(['read'], resolve).value,
        };
      }
      expect(isConvertingLabel()).toBe(true);
      return resolve(source);
    };
    expect(
      markup(htmlLikeFromSource(['provide', 'outer', 'inner'], nested)),
    ).toBe('<default>');
    expect(isConvertingLabel()).toBe(false);
  });

  it('are left when the conversion throws', () => {
    expect(() =>
      htmlLikeFromSource(['provide', 'x', 'boom'], (source) => {
        if (source === 'boom') throw new Error('boom');
        return resolve(source);
      }),
    ).toThrow('boom');
    expect(isConvertingLabel()).toBe(false);
    expect(markup(htmlLikeFromSource(['read'], resolve))).toBe('<default>');
  });
});
