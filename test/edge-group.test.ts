import { digraph } from 'ts-graphviz';
import { fromModel } from 'ts-graphviz/ast';

import { toDot } from '#test/utils';

test('edge group', () => {
  expect(
    fromModel(
      digraph((g) => {
        g.edge(['a', ['b', 'c']]);
      }),
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "children": Array [
        Object {
          "children": Array [
            Object {
              "children": Array [],
              "location": null,
              "targets": Array [
                Object {
                  "children": Array [],
                  "compass": undefined,
                  "id": Object {
                    "children": Array [],
                    "location": null,
                    "quoted": true,
                    "type": "Literal",
                    "value": "a",
                  },
                  "location": null,
                  "port": undefined,
                  "type": "NodeRef",
                },
                Object {
                  "children": Array [
                    Object {
                      "children": Array [],
                      "compass": undefined,
                      "id": Object {
                        "children": Array [],
                        "location": null,
                        "quoted": true,
                        "type": "Literal",
                        "value": "b",
                      },
                      "location": null,
                      "port": undefined,
                      "type": "NodeRef",
                    },
                    Object {
                      "children": Array [],
                      "compass": undefined,
                      "id": Object {
                        "children": Array [],
                        "location": null,
                        "quoted": true,
                        "type": "Literal",
                        "value": "c",
                      },
                      "location": null,
                      "port": undefined,
                      "type": "NodeRef",
                    },
                  ],
                  "location": null,
                  "type": "NodeRefGroup",
                },
              ],
              "type": "Edge",
            },
          ],
          "directed": true,
          "id": undefined,
          "location": null,
          "strict": false,
          "type": "Graph",
        },
      ],
      "location": null,
      "type": "Dot",
    }
  `);
  expect(
    toDot(
      digraph((g) => {
        g.edge(['a', ['b', 'c']]);
      }),
    ),
  ).toMatchInlineSnapshot(`
    digraph {
      "a" -> {"b" "c"};
    }
  `);
});
