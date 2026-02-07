import { describe, expect, test } from 'vitest';
import { createElement, createElementFactory } from './create-element.js';
import { ASTNodeCountExceededError } from './errors.js';

describe('createElement', () => {
  test('Dot', () => {
    const ast = createElement('Dot', {}, []);
    expect(ast).toMatchSnapshot();
  });

  test('Graph', () => {
    const ast = createElement('Graph', {
      strict: false,
      directed: true,
    });
    expect(ast).toMatchSnapshot();
  });

  test('Node', () => {
    const ast = createElement('Node', {
      id: createElement('Literal', {
        value: 'node_id',
        quoted: false,
      }),
    });
    expect(ast).toMatchSnapshot();
  });

  test('Edge', () => {
    const ast = createElement('Edge', {
      targets: [
        createElement('NodeRef', {
          id: createElement('Literal', {
            value: 'a',
            quoted: true,
          }),
        }),
        createElement('NodeRef', {
          id: createElement('Literal', {
            value: 'b',
            quoted: true,
          }),
        }),
      ],
    });
    expect(ast).toMatchSnapshot();
  });

  test('NodeRef', () => {
    const ast = createElement('NodeRef', {
      id: createElement('Literal', {
        value: 'b',
        quoted: true,
      }),
    });
    expect(ast).toMatchSnapshot();
  });

  test('NodeRefGroup', () => {
    const ast = createElement('NodeRefGroup', {}, [
      createElement('NodeRef', {
        id: createElement('Literal', {
          value: 'a',
          quoted: true,
        }),
      }),
      createElement('NodeRef', {
        id: createElement('Literal', {
          value: 'b',
          quoted: true,
        }),
      }),
    ]);
    expect(ast).toMatchSnapshot();
  });

  test('Subgraph', () => {
    const ast = createElement('Subgraph', {}, []);
    expect(ast).toMatchSnapshot();
  });

  test('Literal', () => {
    const ast = createElement('Literal', {
      value: 'literal value',
      quoted: true,
    });
    expect(ast).toMatchSnapshot();
  });

  test('Coment', () => {
    const ast = createElement('Comment', {
      kind: 'Macro',
      value: 'This is comment',
    });
    expect(ast).toMatchSnapshot();
  });

  test('Attribute', () => {
    const ast = createElement('Attribute', {
      key: createElement('Literal', {
        value: 'color',
        quoted: false,
      }),
      value: createElement('Literal', {
        value: 'red',
        quoted: false,
      }),
    });
    expect(ast).toMatchSnapshot();
  });
});

describe('createElementFactory', () => {
  test('returns an independent createElement function', () => {
    const createElement1 = createElementFactory();
    const createElement2 = createElementFactory();

    // Each factory produces its own counter
    for (let i = 0; i < 10; i++) {
      createElement1('Literal', { value: `a${i}`, quoted: false }, []);
    }

    // createElement2 should not be affected by createElement1's count
    expect(() =>
      createElement2('Literal', { value: 'b', quoted: false }, []),
    ).not.toThrow();
  });

  test('respects maxASTNodes option', () => {
    const createElement = createElementFactory({ maxASTNodes: 3 });

    createElement('Literal', { value: 'a', quoted: false }, []);
    createElement('Literal', { value: 'b', quoted: false }, []);
    createElement('Literal', { value: 'c', quoted: false }, []);

    expect(() =>
      createElement('Literal', { value: 'd', quoted: false }, []),
    ).toThrow(ASTNodeCountExceededError);
  });

  test('maxASTNodes=0 disables the limit', () => {
    const createElement = createElementFactory({ maxASTNodes: 0 });

    // Should not throw even with many nodes
    for (let i = 0; i < 1000; i++) {
      createElement('Literal', { value: `v${i}`, quoted: false }, []);
    }
  });

  test('independent counters do not accumulate across factories', () => {
    // Simulate the fix: each call creates a fresh builder
    for (let i = 0; i < 200; i++) {
      const createElement = createElementFactory({ maxASTNodes: 1000 });
      for (let j = 0; j < 10; j++) {
        createElement('Literal', { value: `v${j}`, quoted: false }, []);
      }
    }
    // Total nodes created = 2000, but no single factory exceeded 1000
  });
});
