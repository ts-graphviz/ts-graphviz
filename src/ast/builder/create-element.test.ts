import { createElement } from './create-element.js';

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
