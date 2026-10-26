/**
 * Finds every read of a property that an object does not own, wherever it
 * is in the code, without knowing the option names in advance.
 *
 * `Object.prototype` cannot be given a Proxy as its prototype (it is an
 * immutable prototype object), so the trap is an accessor on
 * `Object.prototype` for every property name the packages' sources
 * mention. A read that reaches one of them found no own property on the
 * way: with a polluted prototype, that read would have taken the polluted
 * value. Only reads made by the packages' own code count.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, sanitize, stringify } from '@ts-graphviz/ast';
import {
  escString,
  htmlLike,
  isDotModel,
  isEdgeModel,
  isForwardRefNode,
  isRootGraphModel,
} from '@ts-graphviz/common';
import { Digraph, Node, OrderedDigraph } from '@ts-graphviz/core';
import { renderHTMLLike } from '@ts-graphviz/react';
import { createElement } from 'react';
import { fromDot, fromDotAll, toDot } from 'ts-graphviz';
import { afterEach, describe, expect, it } from 'vitest';
import { createCommandAndArgs } from '../packages/adapter/src/create-command-and-args.js';
import { ownAdapterOptions } from '../packages/adapter/src/options.js';
import { sourceToRender } from '../packages/adapter/src/source.js';

const packages = fileURLToPath(new URL('../packages/', import.meta.url));

/** The property names the packages' sources mention. */
function propertyNames(): Set<string> {
  const names = new Set<string>();
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) {
        if (entry !== '__snapshots__') visit(path);
      } else if (/\.tsx?$/.test(entry) && !/\.(test|spec)/.test(entry)) {
        const source = readFileSync(path, 'utf8');
        for (const m of source.matchAll(
          /\.([A-Za-z_$][\w$]*)|["'`]([A-Za-z_$][\w$:-]*)["'`]/g,
        )) {
          names.add(m[1] ?? m[2]);
        }
      }
    }
  };
  for (const pkg of readdirSync(packages)) {
    const src = join(packages, pkg, 'src');
    if (statSync(src, { throwIfNoEntry: false })?.isDirectory()) visit(src);
  }
  for (const name of Object.getOwnPropertyNames(Object.prototype)) {
    names.delete(name);
  }
  // The keys of a property descriptor: with an accessor for one of them on
  // Object.prototype, every descriptor object would seem to have it, and
  // Object.defineProperty (used below) would refuse them. A read of these
  // names by the packages is not traced. Every other name is, including
  // `then`, `toJSON`, `length` and `done`, which the runtime also reads: the
  // accessor returns undefined, as an absent property does.
  for (const name of [
    'value',
    'writable',
    'get',
    'set',
    'enumerable',
    'configurable',
  ]) {
    names.delete(name);
  }
  return names;
}

const names = propertyNames();
const reads = new Set<string>();

/** The first stack frame outside this file: where the read happened. */
function reader(): string | undefined {
  const stack = new Error().stack?.split('\n').slice(2) ?? [];
  const frame = stack.find((line) => !line.includes('inherited-reads.test'));
  return frame?.includes('/packages/') && frame.includes('/src/')
    ? frame.trim().replace(/^at /, '').replace(packages, '')
    : undefined;
}

const installed: string[] = [];

function install(): void {
  for (const name of names) {
    Object.defineProperty(Object.prototype, name, {
      configurable: true,
      enumerable: false,
      get() {
        const where = reader();
        if (where !== undefined) reads.add(`${name} at ${where}`);
        return undefined;
      },
      set(value) {
        Object.defineProperty(this, name, {
          value,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      },
    });
    installed.push(name);
  }
}

/** Removes the accessors that were installed, also after a failed install. */
function uninstall(): void {
  for (const name of installed.splice(0)) {
    delete (Object.prototype as Record<string, unknown>)[name];
  }
}

/** Runs `fn` with the accessors installed and returns the reads it made. */
function trace(fn: () => void): string[] {
  reads.clear();
  try {
    install();
    fn();
  } finally {
    uninstall();
  }
  return [...reads].sort();
}

const DOTS = [
  `strict digraph G {
    /* block */ graph [rankdir=LR, label=<<b>title</b>>];
    node [shape=box]; edge [color="red"];
    a [label="a\\lb", xlabel=x]; // slash
    a:p:n -> b -> {c d} [style="setlinewidth(2)"];
    a -> /* inline */ b:sw;
    subgraph cluster_x { label=c; e -> f; subgraph { g } }
    subgraph cluster_x { h }
    {i j} -> subgraph cluster_x {};
    x = y;
    # macro
  }`,
  'graph { a -- b -- c; a, b -- c; subgraph s { d } -- e }',
];

describe('[SM-8] the packages read no inherited property', () => {
  afterEach(() => reads.clear());

  it('when parsing, printing, checking and converting DOT', () => {
    expect(names.size).toBeGreaterThan(300);
    for (const dot of DOTS) {
      const ast = parse(dot);
      expect(
        trace(() => {
          parse(dot);
          stringify(ast);
          stringify(ast, { indentStyle: 'tab', endOfLine: 'crlf' });
          fromDot(dot);
          fromDotAll(dot);
        }),
      ).toStrictEqual([]);
    }
    expect(
      trace(() => {
        for (const format of ['svg', 'png', 'plain', 'json', 'ps'] as const) {
          sanitize(DOTS[0], { format });
        }
      }),
    ).toStrictEqual([]);
  });

  it('when writing models', () => {
    const graphs = [new Digraph('G'), new OrderedDigraph('G')];
    for (const g of graphs) {
      const a = g.createNode('a', { label: escString('\\N') });
      g.createNode('b', { label: htmlLike('<b>b</b>') });
      g.addNode(new Node('c', { width: 1.5 }));
      g.createEdge([a.port({ port: 'p', compass: 'n' }), 'b:q:s', ['c', 'd']]);
      g.createEdge([{ id: 'e' }, { id: 'f', port: 'r' }]);
      g.createSubgraph('cluster_s', { label: 's' }).createNode('g');
      g.addAttributeList('Node', { shape: 'box' });
      g.comment = 'comment';
      expect(trace(() => toDot(g))).toStrictEqual([]);
    }
  });

  it('when rendering HTML-like labels with React', () => {
    const label = createElement(
      'dot:table',
      { border: 1 },
      createElement('dot:tr', {}, createElement('dot:td', { port: 'p' }, 'x')),
    );
    expect(trace(() => renderHTMLLike(label))).toStrictEqual([]);
    // The components and hooks behind renderToDot are rewritten in #1762,
    // which is where their props are traced.
  });

  it('when building the command for the adapter', () => {
    const options = {
      format: 'svg' as const,
      layout: 'neato' as const,
      attributes: { graph: { label: 'x' }, node: { shape: 'box' as const } },
      library: ['lib.ps'],
      sanitize: { maxASTNodes: 1000 },
    };
    expect(
      trace(() => {
        const own = ownAdapterOptions(options);
        createCommandAndArgs(own);
        sourceToRender(DOTS[0], own);
      }),
    ).toStrictEqual([]);
  });
});

describe('[SM-8] parse with a polluted Object.prototype', () => {
  it('returns the AST, not the parser state', () => {
    const proto = Object.prototype as Record<string, unknown>;
    proto.peg$library = true;
    let ast: unknown;
    try {
      ast = parse('digraph { a }');
    } finally {
      delete proto.peg$library;
    }
    expect(ast).toMatchObject({ type: 'Dot' });
  });
});

describe('[SM-8] model guards with a polluted Object.prototype', () => {
  it.each([
    ['id', 'extra', () => isForwardRefNode({})],
    ['targets', [], () => isEdgeModel({ $$type: 'Edge' })],
    ['directed', true, () => isRootGraphModel({ $$type: 'Graph' })],
    ['graphs', [], () => isDotModel({ $$type: 'Dot' })],
  ] as const)(
    'a plain object does not pass for a model through %s',
    (key, value, check) => {
      const proto = Object.prototype as Record<string, unknown>;
      proto[key] = value;
      try {
        expect(check()).toBe(false);
      } finally {
        delete proto[key];
      }
    },
  );
});
