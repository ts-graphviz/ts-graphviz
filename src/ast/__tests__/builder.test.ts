import { AttributeKey } from '../../attribute/index.js';
import { Builder } from '../builder.js';

describe('Builder', () => {
  const builer = new Builder();

  describe('createElement', () => {
    test('Dot', () => {
      const ast = builer.createElement('Dot', {}, []);
      expect(ast).toMatchSnapshot();
    });

    test('Graph', () => {
      const ast = builer.createElement(
        'Graph',
        {
          strict: false,
          directed: true,
        },
        [],
      );
      expect(ast).toMatchSnapshot();
    });

    test('Node', () => {
      const ast = builer.createElement(
        'Node',
        {
          id: builer.createElement(
            'Literal',
            {
              value: 'node_id',
              quoted: false,
            },
            [],
          ),
        },
        [],
      );
      expect(ast).toMatchSnapshot();
    });

    test('Edge', () => {
      const ast = builer.createElement(
        'Edge',
        {
          targets: [
            builer.createElement(
              'NodeRef',
              {
                id: builer.createElement(
                  'Literal',
                  {
                    value: 'a',
                    quoted: true,
                  },
                  [],
                ),
              },
              [],
            ),
            builer.createElement(
              'NodeRef',
              {
                id: builer.createElement(
                  'Literal',
                  {
                    value: 'b',
                    quoted: true,
                  },
                  [],
                ),
              },
              [],
            ),
          ],
        },
        [],
      );
      expect(ast).toMatchSnapshot();
    });

    test('NodeRef', () => {
      const ast = builer.createElement(
        'NodeRef',
        {
          id: builer.createElement(
            'Literal',
            {
              value: 'b',
              quoted: true,
            },
            [],
          ),
        },
        [],
      );
      expect(ast).toMatchSnapshot();
    });

    test('NodeRefGroup', () => {
      const ast = builer.createElement('NodeRefGroup', {}, [
        builer.createElement(
          'NodeRef',
          {
            id: builer.createElement(
              'Literal',
              {
                value: 'a',
                quoted: true,
              },
              [],
            ),
          },
          [],
        ),
        builer.createElement(
          'NodeRef',
          {
            id: builer.createElement(
              'Literal',
              {
                value: 'b',
                quoted: true,
              },
              [],
            ),
          },
          [],
        ),
      ]);
      expect(ast).toMatchSnapshot();
    });

    test('Subgraph', () => {
      const ast = builer.createElement('Subgraph', {}, []);
      expect(ast).toMatchSnapshot();
    });

    test('Literal', () => {
      const ast = builer.createElement(
        'Literal',
        {
          value: 'literal value',
          quoted: true,
        },
        [],
      );
      expect(ast).toMatchSnapshot();
    });

    test('Coment', () => {
      const ast = builer.createElement(
        'Comment',
        {
          kind: 'Macro',
          value: 'This is comment',
        },
        [],
      );
      expect(ast).toMatchSnapshot();
    });

    test('Attribute', () => {
      const ast = builer.createElement(
        'Attribute',
        {
          key: builer.createElement<AttributeKey>(
            'Literal',
            {
              value: 'color',
              quoted: false,
            },
            [],
          ),
          value: builer.createElement(
            'Literal',
            {
              value: 'red',
              quoted: false,
            },
            [],
          ),
        },
        [],
      );
      expect(ast).toMatchSnapshot();
    });
  });
});
