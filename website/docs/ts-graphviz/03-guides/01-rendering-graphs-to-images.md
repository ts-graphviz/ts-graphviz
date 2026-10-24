---
description: Render graphs to images like SVG or PNG using ts-graphviz.
---
# Rendering Graphs to Images

While `ts-graphviz` module focuses on modeling graphs using the DOT language and generating DOT strings, you may want to render your graphs into image formats like SVG or PNG. This is where `ts-graphviz/adapter` module comes into play.

`ts-graphviz/adapter` module allows you to execute the Graphviz `dot` command in various runtime environments (Node.js, Deno) to convert DOT strings into image files. This enables you to visualize your graphs as images within your applications or export them for use elsewhere.

:::danger
At this time, `ts-graphviz/adapter` does not support running in a browser. If you want to visualize DOT language in a browser or output it as an image, you need to use other npm libraries such as [d3-graphviz](https://www.npmjs.com/package/d3-graphviz) or [@hpcc-js/wasm-graphviz](https://www.npmjs.com/package/@hpcc-js/wasm-graphviz).
:::

## Features:

- **Execute Graphviz Commands**: Run the `dot` command from your code to generate images.
- **Support for Multiple Runtimes**: Works with Node.js and Deno environments.
- **Output Formats**: Convert DOT strings to formats like SVG, PNG, PDF, etc.

:::warning
Ensure that [Graphviz](https://graphviz.org/download/) is installed on your system so that the `dot` command is available.
:::

## Example:

### Converting DOT to an Image Stream

```typescript
import { toStream } from 'ts-graphviz/adapter';

const dot = `
  digraph example {
    node1 [ label = "My Node" ];
  }
`;

const stream = await toStream(dot, { format: 'svg' });

// In Node.js
stream.pipe(process.stdout);

// In Deno
await stream.pipeTo(Deno.stdout.writable);
```

### Writing DOT to an Image File

```typescript
import { toFile } from 'ts-graphviz/adapter';

const dot = `
  digraph example {
    node1 [ label = "My Node" ];
  }
`;

await toFile(dot, './result.svg', { format: 'svg' });
```

## Explanation

- **Executing the `dot` Command**: The adapter provides functions that internally execute the `dot` command with the provided DOT string and options.
- **Output Formats**: Specify the desired output format (e.g., `svg`, `png`) through the options.
- **Runtime Compatibility**: Designed to work seamlessly in both Node.js and Deno environments.

## When to Use `ts-graphviz/adapter` module

- When you need to render your graphs into image files for visualization.
- If you want to generate images dynamically within your application.
- When integrating graph rendering into server-side scripts or applications.

## Additional Notes

- **Browser Support**: `ts-graphviz/adapter` does not support running in a browser environment. If you need to render graphs in a browser, consider libraries such as `d3-graphviz` or `@hpcc-js/wasm`. These use WebAssembly to render DOT graphs in the browser.
- **Graphviz Installation**: Make sure that Graphviz is installed and accessible in your system's PATH.
- **Error Handling**: Handle errors that may occur if the `dot` command fails or if Graphviz is not installed.
