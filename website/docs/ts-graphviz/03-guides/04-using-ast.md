---
description: Manipulate DOT graphs at the AST level with @ts-graphviz/ast.
---
# Using Abstract Syntax Tree (AST)

For advanced use cases, `ts-graphviz/ast` module provides an API to handle Abstract Syntax Trees (ASTs) of DOT language graphs.

## Available Functions

The following functions are provided:

- `fromModel`: Converts a **Model** to an **AST**.
- `toModel`: Converts an **AST** to a **Model**.
- `stringify`: Converts an **AST** to a **DOT** string.
- `parse`: Converts a **DOT** string to an **AST**.

![State Machine](./img/state-machine.svg)

:::note
The `toDot` function provided by the `ts-graphviz` package is a composition of `fromModel` and `stringify`. The `fromDot` function is a composition of `parse` and `toModel`.
:::

## Example

### Parsing a DOT String into an AST


```typescript
import { parse } from 'ts-graphviz/ast';

const ast = parse(`
  digraph example {
    node1 [
      label = "My Node",
    ]
  }
`);

console.log(JSON.stringify(ast, null, 2));
```

The `ast` variable now contains the AST representation of the DOT graph, which you can manipulate programmatically.

<details>
<summary>Click to view the AST structure</summary>

```json
{
  "type": "Dot",
  "location": {
    "start": { "offset": 3, "line": 2, "column": 3 },
    "end": { "offset": 68, "line": 7, "column": 1 }
  },
  "children": [
    {
      "id": {
        "value": "example",
        "quoted": false,
        "type": "Literal",
        "location": {
          "start": { "offset": 11, "line": 2, "column": 11 },
          "end": { "offset": 18, "line": 2, "column": 18 }
        },
        "children": []
      },
      "directed": true,
      "strict": false,
      "type": "Graph",
      "location": {
        "start": { "offset": 3, "line": 2, "column": 3 },
        "end": { "offset": 67, "line": 6, "column": 4 }
      },
      "children": [
        {
          "id": {
            "value": "node1",
            "quoted": false,
            "type": "Literal",
            "location": {
              "start": { "offset": 25, "line": 3, "column": 5 },
              "end": { "offset": 30, "line": 3, "column": 10 }
            },
            "children": []
          },
          "type": "Node",
          "location": {
            "start": { "offset": 25, "line": 3, "column": 5 },
            "end": { "offset": 63, "line": 5, "column": 6 }
          },
          "children": [
            {
              "key": {
                "value": "label",
                "quoted": false,
                "type": "Literal",
                "location": {
                  "start": { "offset": 39, "line": 4, "column": 7 },
                  "end": { "offset": 44, "line": 4, "column": 12 }
                },
                "children": []
              },
              "value": {
                "value": "My Node",
                "quoted": true,
                "type": "Literal",
                "location": {
                  "start": { "offset": 47, "line": 4, "column": 15 },
                  "end": { "offset": 56, "line": 4, "column": 24 }
                },
                "children": []
              },
              "location": {
                "start": { "offset": 39, "line": 4, "column": 7 },
                "end": { "offset": 57, "line": 4, "column": 25 }
              },
              "type": "Attribute",
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```

</details>
