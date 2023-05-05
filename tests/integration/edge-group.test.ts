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
    {
      "children": [
        {
          "children": [
            {
              "children": [],
              "location": null,
              "targets": [
                {
                  "children": [],
                  "compass": undefined,
                  "id": {
                    "children": [],
                    "location": null,
                    "quoted": true,
                    "type": "Literal",
                    "value": "a",
                  },
                  "location": null,
                  "port": undefined,
                  "type": "NodeRef",
                },
                {
                  "children": [
                    {
                      "children": [],
                      "compass": undefined,
                      "id": {
                        "children": [],
                        "location": null,
                        "quoted": true,
                        "type": "Literal",
                        "value": "b",
                      },
                      "location": null,
                      "port": undefined,
                      "type": "NodeRef",
                    },
                    {
                      "children": [],
                      "compass": undefined,
                      "id": {
                        "children": [],
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
