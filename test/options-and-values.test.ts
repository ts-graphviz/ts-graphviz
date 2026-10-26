import {
  digraph,
  fromDot,
  isEdgeModel,
  isForwardRefNode,
  isNodeModel,
  isRootGraphModel,
  toDot,
} from 'ts-graphviz';
import { createElement, parse, stringify } from 'ts-graphviz/ast';
import { afterEach, describe, expect, it } from 'vitest';
import { createCommandAndArgs } from '../packages/adapter/src/create-command-and-args.js';

const proto = Object.prototype as Record<string, unknown>;
const added: string[] = [];
function inherit(entries: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(entries)) {
    proto[key] = value;
    added.push(key);
  }
}
afterEach(() => {
  for (const key of added.splice(0)) delete proto[key];
});

describe('options are read from their own properties', () => {
  it('adapter command and arguments', () => {
    inherit({
      dotCommand: '/opt/other/dot',
      library: ['other.ps'],
      suppressWarnings: false,
      graph: { imagepath: 'other' },
      layout: 'neato',
    });
    expect(createCommandAndArgs({})).toStrictEqual(['dot', ['-q', '-Tsvg']]);
    expect(
      createCommandAndArgs({ format: 'png', attributes: {} }),
    ).toStrictEqual(['dot', ['-q', '-Tpng']]);
  });

  it('adapter library elements', () => {
    inherit({ 0: 'other.ps' });
    expect(createCommandAndArgs({ library: new Array(1) })).toStrictEqual([
      'dot',
      ['-q', '-Tsvg'],
    ]);
  });

  it('own options that are not enumerable are still read', () => {
    const options = Object.defineProperty({}, 'dotCommand', {
      value: '/usr/local/bin/dot',
    });
    expect(createCommandAndArgs(options)[0]).toBe('/usr/local/bin/dot');
  });

  it('an accessor cannot remove an option before it is read', () => {
    const options = Object.create({ dotCommand: '/opt/other/dot' });
    Object.defineProperty(options, 'a', {
      enumerable: true,
      get() {
        delete this.dotCommand;
        return undefined;
      },
    });
    options.dotCommand = 'dot';
    expect(createCommandAndArgs(options)[0]).toBe('dot');
  });

  it('ports and compass points of parsed nodes', () => {
    inherit({
      port: { type: 'Literal', value: 'p', quoted: false, children: [] },
      compass: { type: 'Literal', value: 'n', quoted: false, children: [] },
    });
    const dot = 'digraph {\n  a -> b;\n}';
    expect(stringify(parse(dot))).toBe(dot);
    expect(fromDot(dot).edges[0].targets).toStrictEqual([
      { id: 'a', port: undefined, compass: undefined },
      { id: 'b', port: undefined, compass: undefined },
    ]);
  });

  it('block comments with long runs of spaces parse in linear time', () => {
    const start = performance.now();
    fromDot(`/*${' '.repeat(80000)}*/ digraph {}`);
    expect(performance.now() - start).toBeLessThan(1000);
  });

  it('parse limits and rule', () => {
    inherit({ maxASTNodes: 1, maxInputSize: 1, startRule: 'Node' });
    expect(parse('digraph { a -> b }').type).toBe('Dot');
  });

  it('printing and conversion', () => {
    const g = digraph('G', (g) => g.edge(['a', 'b']));
    const clean = toDot(g);
    inherit({ indentSize: 9, print: { indentSize: 9 }, convert: {} });
    expect(toDot(g)).toBe(clean);
    expect(stringify(parse(clean))).toBe(clean);
  });

  it('options of the generated parser', () => {
    inherit({ peg$library: true, peg$currPos: 5 });
    const ast = parse('digraph { a }');
    expect(ast.type).toBe('Dot');
    expect(fromDot('digraph { a }').nodes.map((n) => n.id)).toStrictEqual([
      'a',
    ]);
  });

  it('ids of graphs and subgraphs created without one', () => {
    inherit({
      id: { type: 'Literal', value: 'x', quoted: false, children: [] },
    });
    const ast = createElement('Dot', {}, [
      createElement('Graph', { directed: true, strict: false }, [
        createElement('Subgraph', {}, []),
      ]),
    ]);
    expect(stringify(ast)).toBe('digraph {\n  subgraph {}\n}');
    const model = fromDot('graph { subgraph { a } }');
    expect(model.id).toBeUndefined();
    expect(model.subgraphs.map((s) => s.id)).toStrictEqual([undefined]);
  });

  it('model type guards', () => {
    inherit({ $$type: 'Node', id: 'a' });
    expect(isNodeModel({})).toBe(false);
    expect(isForwardRefNode({})).toBe(false);
    expect(isForwardRefNode({ id: 'a' })).toBe(true);
    expect(isNodeModel(digraph().node('a'))).toBe(true);
  });

  it('model type guards read the other fields from the object too', () => {
    inherit({ id: 'a', targets: [], directed: true });
    expect(isNodeModel({ $$type: 'Node' })).toBe(false);
    expect(isEdgeModel({ $$type: 'Edge' })).toBe(false);
    expect(isRootGraphModel({ $$type: 'Graph' })).toBe(false);
  });
});

describe('attribute values are written as text', () => {
  const nodesAfter = (value: unknown) => {
    const g = digraph('G');
    g.node('a', { label: value as string });
    const dot = toDot(g);
    return { dot, nodes: fromDot(dot).nodes.map((n) => n.id) };
  };

  it('a quote after an even run of backslashes is escaped', () => {
    const { nodes } = nodesAfter('x\\\\"]; extra [shape=box]; b [ //');
    expect(nodes).toStrictEqual(['a']);
  });

  it('a trailing backslash does not escape the closing quote', () => {
    const g = digraph('G');
    g.node('a', { label: 'x\\', tooltip: ' ]; extra [shape=box]; b [ //' });
    expect(fromDot(toDot(g)).nodes.map((n) => n.id)).toStrictEqual(['a']);
  });

  it('markup with unbalanced brackets is a string, not an HTML-like label', () => {
    const { dot, nodes } = nodesAfter(
      '<a> ]; extra [shape=box]; a [label= <b>',
    );
    expect(nodes).toStrictEqual(['a']);
    expect(dot).toContain('label = "<a> ]; extra');
  });

  it('balanced markup is still an HTML-like label', () => {
    expect(nodesAfter('<<b>bold</b>>').dot).toContain('label = <<b>bold</b>>;');
  });

  it('a value that is not a string, number or boolean is an escaped string', () => {
    const { nodes } = nodesAfter(['x]; extra [shape=box]; a [label=y']);
    expect(nodes).toStrictEqual(['a']);
  });

  it('an attribute key that is not a plain identifier is quoted', () => {
    const g = digraph('G');
    g.node('a', { 'x=1]; extra [shape': 'box' } as never);
    const dot = toDot(g);
    expect(fromDot(dot).nodes.map((n) => n.id)).toStrictEqual(['a']);
    expect(dot).toContain('"x=1]; extra [shape" = "box";');
    expect(toDot(digraph('G', (g) => g.node('a', { label: 'x' })))).toContain(
      'label = "x";',
    );
  });

  it('an array where a string is expected is written as escaped text', () => {
    const inj = 'x"; extra [shape=box]; "y';
    const g = digraph('G');
    g.createNode([inj] as never);
    g.edge([{ id: 'a', port: [inj] as never }, 'b']);
    g.edge([{ id: 'c', compass: [inj] as never }, 'd']);
    g.set([inj] as never, 'v');
    const ids = fromDot(toDot(g)).nodes.map((n) => n.id);
    expect(ids).not.toContain('extra');
    expect(ids).toStrictEqual([inj]);
  });

  it('a `<…>` check over many lines stays linear', () => {
    const label = `${'<\n'.repeat(40000)}<`;
    const start = performance.now();
    toDot(digraph('G', (g) => g.node('a', { label })));
    expect(performance.now() - start).toBeLessThan(1000);
  });

  it('a carriage return in a comment starts a new comment line', () => {
    for (const kind of ['Slash', 'Macro', 'Block'] as const) {
      const ast = parse('digraph {\n  a;\n}');
      const graph = ast.children[0] as { children: unknown[] };
      graph.children.unshift({
        type: 'Comment',
        kind,
        value: 'x\rextra [shape=box]; b',
        children: [],
      });
      const ids = fromDot(stringify(ast)).nodes.map((n) => n.id);
      expect(ids).toStrictEqual(['a']);
    }
  });

  it('a comment that is not a string is written as text', () => {
    const g = digraph('G');
    g.node('a').comment = ['x'] as never;
    expect(toDot(g)).toContain('// x');
  });

  it('numbers DOT does not read as numerals are quoted', () => {
    expect(nodesAfter(1e21).dot).toContain('label = "1e+21";');
    expect(nodesAfter(2).dot).toContain('label = 2;');
    expect(nodesAfter(true).dot).toContain('label = true;');
  });
});
