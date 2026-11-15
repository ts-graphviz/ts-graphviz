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
- **Checked Source**: The DOT source is checked with `sanitize` before the command starts (see [Sanitizing the DOT source](#sanitizing-the-dot-source)).

:::warning
Ensure that [Graphviz](https://graphviz.org/download/) is installed on your system so that the `dot` command is available.
:::

## Example:

### Rendering DOT to a Blob

```typescript
import { toBlob } from 'ts-graphviz/adapter';

const dot = `
  digraph example {
    node1 [ label = "My Node" ];
  }
`;

const blob = await toBlob(dot, { format: 'svg' });

console.log(blob.type); // 'image/svg+xml'
const svg = await blob.text();
```

`toBlob` returns once `dot` has succeeded, with the whole output in memory; every failure rejects the promise before you read anything. Read the Blob with `text()`, `arrayBuffer()` or `stream()`, or return it from a request handler with `new Response(blob)`.

The default `format` is `'svg'`, and the default `layout` is `'dot'`.

### Rendering a Model

`toBlob` from `ts-graphviz/adapter` also takes a model or its [DOT DSL](./01-dot-dsl.md), and calls `toDot` for you:

```typescript
import { digraph } from 'ts-graphviz';
import { toBlob } from 'ts-graphviz/adapter';

const G = digraph((g) => {
  g.edge(['a', 'b']);
});

const blob = await toBlob(G, { format: 'png' });

console.log(blob.type); // 'image/png'
```

### Writing the Image to a File

Where the output goes, and which paths are acceptable, is up to your application:

```typescript
import { writeFile } from 'node:fs/promises';
import { toBlob } from 'ts-graphviz/adapter';

declare const dot: string;

const blob = await toBlob(dot, { format: 'png' });
await writeFile('./result.png', blob.stream());
// In Deno: await Deno.writeFile('./result.png', blob.stream());
```

:::tip
In a browser, show an SVG Blob with `<img src>`, not as a document: a `blob:` URL of `image/svg+xml` opened in a tab or a frame runs with your application's origin.
:::

## Sanitizing the DOT source {#sanitizing-the-dot-source}

Graphviz reads the files a DOT source names and writes the links it gives into its output. So `toBlob` checks the source with [`sanitize`](./06-using-ast.md#checking-untrusted-dot) before it starts the command, and gives the command the checked text. This is the default (`sanitize: true`).

The check rejects, with a `DOMException` named `SecurityError` whose `code` is `TSG_ERR_UNSAFE_DOT`:

- attributes that make Graphviz read a file: `image`, `shapefile`, `imagepath`, `fontpath`, `stylesheet`, a font name that is a path, and `<IMG>` in HTML-like labels;
- links (`URL`, `href`, …) other than relative, `http`, `https` or `mailto` ones, such as `URL="javascript:…"`;
- values that reach some output formats unescaped, such as an unknown `style` or a control character;
- output formats that have not been checked, such as `vml` or `fig`.

A source that does not parse rejects with a `DotSyntaxError` (`code` `TSG_ERR_DOT_SYNTAX`), before the command starts.

```typescript
import { toBlob } from 'ts-graphviz/adapter';

const dot = 'digraph { a [image = "./logo.png"]; }';

try {
  await toBlob(dot);
} catch (e) {
  console.log(e instanceof DOMException && e.name); // 'SecurityError'
}

// The DOT is your own: render it as it is.
const blob = await toBlob(dot, { sanitize: false });
```

The `sanitize` option takes:

| Value | Meaning |
| --- | --- |
| `true` (default) | Check the source with the default policy. |
| `{ policy: 'strict' }` | Also reject every attribute and HTML-like tag that Graphviz does not define. |
| `{ maxASTNodes: … }` and the other parser limits | Check the source with these limits. They can be given together with `policy`. |
| `false` | No check. The source reaches Graphviz unchanged, without being parsed. |

```typescript
import { toBlob } from 'ts-graphviz/adapter';

declare const untrustedDot: string;

const blob = await toBlob(untrustedDot, {
  sanitize: { policy: 'strict' },
});
```

:::danger
Set `sanitize: false` only for DOT that your application wrote itself, with every attribute value and label in it trusted or validated: a model whose `image` comes from a request is not trusted DOT. Whether to check is your application's decision: never take the value of `sanitize` from a request.

`sanitize` checks the DOT; it is not a sandbox. For DOT from a party you do not trust, also set `signal` and `maxOutputSize`, and run Graphviz in an isolated environment. The [Security model](../11-advanced-topics/06-security-model.md) lists what is checked and what is not.
:::

## Limiting time and output size

Layout cost depends on the DOT source, and `toBlob` does not limit it by default.

- `signal` stops the command: when the signal aborts, the process is killed and the call rejects with `signal.reason`. `AbortSignal.timeout(ms)` gives a time limit, and rejects with a `DOMException` named `TimeoutError`.
- `maxOutputSize` is the maximum size of the output in bytes. The default is 128 MiB. When the command writes more, it is killed and the call rejects with a `RangeError` whose `code` is `TSG_ERR_OUTPUT_LIMIT_EXCEEDED`. `0` disables the limit.

```typescript
import { toBlob } from 'ts-graphviz/adapter';

declare const dot: string;

const blob = await toBlob(dot, {
  format: 'svg',
  signal: AbortSignal.timeout(10_000), // 10 seconds
  maxOutputSize: 10 * 1024 * 1024, // 10 MiB
});
```

## Handling errors

Every error the adapter raises on purpose has a `code` that starts with `TSG_ERR_`. Match on the `code`, not on the message: messages may change in any release. `isTsGraphvizError(e)` tells that an error has one.

| Situation | Error | `code` |
| --- | --- | --- |
| The DOT does not parse | `DotSyntaxError` | `TSG_ERR_DOT_SYNTAX` |
| `sanitize` rejects the DOT or the output format | `DOMException` named `SecurityError` | `TSG_ERR_UNSAFE_DOT` |
| A data option (`format`, `layout`, `attributes`, a number or a flag) is outside its type or range | `TypeError` or `RangeError` | `TSG_ERR_INVALID_OPTION` |
| The command cannot start, or exits with an error | `CommandExecutionError` | `TSG_ERR_COMMAND_FAILED` |
| The output is larger than `maxOutputSize`, or `maxOutputSize` is negative or not finite | `RangeError` | `TSG_ERR_OUTPUT_LIMIT_EXCEEDED` |
| `signal` aborts | `signal.reason` (an `AbortError` or `TimeoutError`) | none |

A `CommandExecutionError` has the `command` that was run and, when the process did start, `exit.code`, `exit.signal` and `exit.stderr`. If Graphviz is not installed, `exit` is `undefined` and `cause` is the error of the runtime.

```typescript
import { isTsGraphvizError } from 'ts-graphviz';
import { CommandExecutionError, toBlob } from 'ts-graphviz/adapter';

declare const dot: string;

try {
  const blob = await toBlob(dot, { signal: AbortSignal.timeout(10_000) });
  console.log(blob.size);
} catch (e) {
  if (e instanceof CommandExecutionError) {
    // code: 'TSG_ERR_COMMAND_FAILED'
    console.error(e.command, e.exit?.code, e.exit?.signal);
    console.error(e.exit?.stderr);
  } else if (isTsGraphvizError(e)) {
    switch (e.code) {
      case 'TSG_ERR_DOT_SYNTAX':
        console.error('The DOT does not parse.');
        break;
      case 'TSG_ERR_UNSAFE_DOT':
        console.error('The DOT was rejected by sanitize.');
        break;
      case 'TSG_ERR_OUTPUT_LIMIT_EXCEEDED':
        console.error('The output is too large.');
        break;
      default:
        throw e;
    }
  } else if (e instanceof DOMException && e.name === 'TimeoutError') {
    console.error('Graphviz took too long.');
  } else {
    throw e;
  }
}
```

:::warning
The message of a `CommandExecutionError` and its `exit.stderr` come from Graphviz. They can contain file paths and parts of the DOT source. Log them for your operators; do not show them to end users as they are.
:::

## Explanation

- **Executing the `dot` Command**: `toBlob` executes the `dot` command with the provided DOT string (or model) and options. The command is started with an argument array, without a shell.
- **Output Formats**: Specify the desired output format (e.g., `svg`, `png`) through the options; the Blob's `type` is its media type, or empty for a format without a well-known one.
- **Runtime Compatibility**: Works in both Node.js and Deno environments.
- **Trusted Options**: `dotCommand`, `library`, `customFormats` and `customLayouts` are configuration of your application. Do not take them from end-user input. The other options are checked at run time.

## When to Use `ts-graphviz/adapter` module

- When you need to render your graphs into image files for visualization.
- If you want to generate images dynamically within your application.
- When integrating graph rendering into server-side scripts or applications.

## Additional Notes

- **Browser Support**: `ts-graphviz/adapter` does not support running in a browser environment; there, `toBlob` throws an error whose `code` is `TSG_ERR_UNSUPPORTED_ENVIRONMENT`. If you need to render graphs in a browser, consider libraries such as `d3-graphviz` or `@hpcc-js/wasm-graphviz`. These use WebAssembly to render DOT graphs in the browser.
- **Graphviz Installation**: Make sure that Graphviz is installed and accessible in your system's PATH.
- **Upgrading**: If your code calls `toStream` or `toFile`, see the [migration guide](../99-migration-guides/v3-to-v4/index.md).
