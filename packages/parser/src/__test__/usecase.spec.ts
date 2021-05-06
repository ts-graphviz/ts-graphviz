import { Digraph } from 'ts-graphviz';
import { dot, parse } from '../usecase';

describe('parse function', () => {
  test('simple digraph', () => {
    const G = parse('digraph {}');
    expect(G).toBeInstanceOf(Digraph);
    expect(G.strict).toStrictEqual(false);
  });
});

describe('dot template tag', () => {
  test('simple digraph', () => {
    const G = dot`digraph {}`;
    expect(G).toBeInstanceOf(Digraph);
    expect(G.strict).toStrictEqual(false);
  });
});
