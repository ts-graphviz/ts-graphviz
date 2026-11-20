import { isTsGraphvizError } from '@ts-graphviz/common';
import { Digraph, defaultModelKit } from '@ts-graphviz/core';
import { describe, expect, it } from 'vitest';
import { fromDot } from './from-dot.js';
import { digraph } from './model-factory.js';
import { toDot } from './to-dot.js';

const COMPASS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'c', '_'];

describe('compass points', { tags: ['SM-2'] }, () => {
  it.each(COMPASS)('writes %s', (compass) => {
    const g = new Digraph();
    g.addEdge(
      defaultModelKit.createEdge([
        { id: 'a', port: 'p', compass } as never,
        'b',
      ]),
    );
    const [edge] = fromDot(toDot(g)).getEdges();
    expect(edge.targets[0]).toMatchObject({ id: 'a', port: 'p', compass });
  });

  it.each([
    ['text that is not a compass point', 'north'],
    ['text that would end the string', 'n" ]; extra [shape=box]; x -> "y'],
    ['an upper-case point', 'N'],
    ['a value that is not a string', ['n']],
    ['a value that has no text', Object.create(null)],
  ])('rejects %s', (_, compass) => {
    const g = new Digraph();
    g.addEdge(defaultModelKit.createEdge([{ id: 'a', compass } as never, 'b']));
    let error: unknown;
    try {
      toDot(g);
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(TypeError);
    expect(isTsGraphvizError(error)).toBe(true);
    expect(error).toMatchObject({ code: 'TSG_ERR_INVALID_EDGE_TARGETS' });
  });

  it('leaves out an empty compass point', () => {
    const g = new Digraph();
    g.addEdge(
      defaultModelKit.createEdge([{ id: 'a', compass: '' } as never, 'b']),
    );
    expect(toDot(g)).toContain('"a" -> "b"');
  });
});

describe('string edge targets', { tags: ['SM-2'] }, () => {
  it('are refused when a part would be dropped, when the edge is created', () => {
    for (const target of ['a:p:north', 'a:b:c:d']) {
      expect(() => defaultModelKit.createEdge([target, 'b'])).toThrow(
        expect.objectContaining({
          name: 'TypeError',
          code: 'TSG_ERR_INVALID_EDGE_TARGETS',
        }),
      );
      expect(() => digraph((g) => g.edge([target, 'b']))).toThrow(
        expect.objectContaining({ code: 'TSG_ERR_INVALID_EDGE_TARGETS' }),
      );
    }
  });

  it('take an id that contains ":" as an object', () => {
    const g = new Digraph();
    g.addEdge(defaultModelKit.createEdge([{ id: 'a:b' }, 'c']));
    expect(fromDot(toDot(g)).getEdges()[0].targets[0]).toMatchObject({
      id: 'a:b',
    });
  });
});
