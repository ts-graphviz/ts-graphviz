import { parse, stringify } from '@ts-graphviz/ast';
import { fromDot, toDot } from 'ts-graphviz';
import { describe, expect, test } from 'vitest';

describe('issue #1335', () => {
  test('', () => {
    const src = `digraph g {
   a [label=<<table><tr><td>NOK</td></tr></table>>]
   b [label=<<b>NOK<b>>]
   c [label=<OK>];
}`;
    const ast = parse(src);
    expect(ast).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "children": [],
                    "key": {
                      "children": [],
                      "location": {
                        "end": {
                          "column": 12,
                          "line": 2,
                          "offset": 23,
                        },
                        "source": undefined,
                        "start": {
                          "column": 7,
                          "line": 2,
                          "offset": 18,
                        },
                      },
                      "quoted": false,
                      "type": "Literal",
                      "value": "label",
                    },
                    "location": {
                      "end": {
                        "column": 51,
                        "line": 2,
                        "offset": 62,
                      },
                      "source": undefined,
                      "start": {
                        "column": 7,
                        "line": 2,
                        "offset": 18,
                      },
                    },
                    "type": "Attribute",
                    "value": {
                      "children": [],
                      "location": {
                        "end": {
                          "column": 51,
                          "line": 2,
                          "offset": 62,
                        },
                        "source": undefined,
                        "start": {
                          "column": 13,
                          "line": 2,
                          "offset": 24,
                        },
                      },
                      "quoted": "html",
                      "type": "Literal",
                      "value": "<table><tr><td>NOK</td></tr></table>",
                    },
                  },
                ],
                "id": {
                  "children": [],
                  "location": {
                    "end": {
                      "column": 5,
                      "line": 2,
                      "offset": 16,
                    },
                    "source": undefined,
                    "start": {
                      "column": 4,
                      "line": 2,
                      "offset": 15,
                    },
                  },
                  "quoted": false,
                  "type": "Literal",
                  "value": "a",
                },
                "location": {
                  "end": {
                    "column": 52,
                    "line": 2,
                    "offset": 63,
                  },
                  "source": undefined,
                  "start": {
                    "column": 4,
                    "line": 2,
                    "offset": 15,
                  },
                },
                "type": "Node",
              },
              {
                "children": [
                  {
                    "children": [],
                    "key": {
                      "children": [],
                      "location": {
                        "end": {
                          "column": 12,
                          "line": 3,
                          "offset": 75,
                        },
                        "source": undefined,
                        "start": {
                          "column": 7,
                          "line": 3,
                          "offset": 70,
                        },
                      },
                      "quoted": false,
                      "type": "Literal",
                      "value": "label",
                    },
                    "location": {
                      "end": {
                        "column": 24,
                        "line": 3,
                        "offset": 87,
                      },
                      "source": undefined,
                      "start": {
                        "column": 7,
                        "line": 3,
                        "offset": 70,
                      },
                    },
                    "type": "Attribute",
                    "value": {
                      "children": [],
                      "location": {
                        "end": {
                          "column": 24,
                          "line": 3,
                          "offset": 87,
                        },
                        "source": undefined,
                        "start": {
                          "column": 13,
                          "line": 3,
                          "offset": 76,
                        },
                      },
                      "quoted": "html",
                      "type": "Literal",
                      "value": "<b>NOK<b>",
                    },
                  },
                ],
                "id": {
                  "children": [],
                  "location": {
                    "end": {
                      "column": 5,
                      "line": 3,
                      "offset": 68,
                    },
                    "source": undefined,
                    "start": {
                      "column": 4,
                      "line": 3,
                      "offset": 67,
                    },
                  },
                  "quoted": false,
                  "type": "Literal",
                  "value": "b",
                },
                "location": {
                  "end": {
                    "column": 25,
                    "line": 3,
                    "offset": 88,
                  },
                  "source": undefined,
                  "start": {
                    "column": 4,
                    "line": 3,
                    "offset": 67,
                  },
                },
                "type": "Node",
              },
              {
                "children": [
                  {
                    "children": [],
                    "key": {
                      "children": [],
                      "location": {
                        "end": {
                          "column": 12,
                          "line": 4,
                          "offset": 100,
                        },
                        "source": undefined,
                        "start": {
                          "column": 7,
                          "line": 4,
                          "offset": 95,
                        },
                      },
                      "quoted": false,
                      "type": "Literal",
                      "value": "label",
                    },
                    "location": {
                      "end": {
                        "column": 17,
                        "line": 4,
                        "offset": 105,
                      },
                      "source": undefined,
                      "start": {
                        "column": 7,
                        "line": 4,
                        "offset": 95,
                      },
                    },
                    "type": "Attribute",
                    "value": {
                      "children": [],
                      "location": {
                        "end": {
                          "column": 17,
                          "line": 4,
                          "offset": 105,
                        },
                        "source": undefined,
                        "start": {
                          "column": 13,
                          "line": 4,
                          "offset": 101,
                        },
                      },
                      "quoted": "html",
                      "type": "Literal",
                      "value": "OK",
                    },
                  },
                ],
                "id": {
                  "children": [],
                  "location": {
                    "end": {
                      "column": 5,
                      "line": 4,
                      "offset": 93,
                    },
                    "source": undefined,
                    "start": {
                      "column": 4,
                      "line": 4,
                      "offset": 92,
                    },
                  },
                  "quoted": false,
                  "type": "Literal",
                  "value": "c",
                },
                "location": {
                  "end": {
                    "column": 19,
                    "line": 4,
                    "offset": 107,
                  },
                  "source": undefined,
                  "start": {
                    "column": 4,
                    "line": 4,
                    "offset": 92,
                  },
                },
                "type": "Node",
              },
            ],
            "directed": true,
            "id": {
              "children": [],
              "location": {
                "end": {
                  "column": 10,
                  "line": 1,
                  "offset": 9,
                },
                "source": undefined,
                "start": {
                  "column": 9,
                  "line": 1,
                  "offset": 8,
                },
              },
              "quoted": false,
              "type": "Literal",
              "value": "g",
            },
            "location": {
              "end": {
                "column": 2,
                "line": 5,
                "offset": 109,
              },
              "source": undefined,
              "start": {
                "column": 1,
                "line": 1,
                "offset": 0,
              },
            },
            "strict": false,
            "type": "Graph",
          },
        ],
        "location": {
          "end": {
            "column": 2,
            "line": 5,
            "offset": 109,
          },
          "source": undefined,
          "start": {
            "column": 1,
            "line": 1,
            "offset": 0,
          },
        },
        "type": "Dot",
      }
    `);
    expect(stringify(ast)).toMatchInlineSnapshot(`
      "digraph g {
        a [
          label = <<table><tr><td>NOK</td></tr></table>>;
        ];
        b [
          label = <<b>NOK<b>>;
        ];
        c [
          label = <OK>;
        ];
      }"
    `);

    const model = fromDot(src);

    const dot = toDot(model);
    expect(dot).toMatchInlineSnapshot(`
      "digraph "g" {
        "a" [
          label = <<table><tr><td>NOK</td></tr></table>>;
        ];
        "b" [
          label = <<b>NOK<b>>;
        ];
        "c" [
          label = "OK";
        ];
      }"
    `);
  });
});
