import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";
import tsconfigPaths from 'vite-tsconfig-paths'


export default defineConfig({
  build: {
    target: "esnext",
    ssr: true,
    lib: {
      entry: {
        'ts-graphviz': "src/ts-graphviz.ts",
        'ast': "src/ast.ts",
        'common': "src/common.ts",
        'core': "src/core.ts",
        'utils': "src/utils.ts",
        'adapter/types': 'src/adapter/types.ts',
        'adapter/utils': 'src/adapter/utils.ts',
        'adapter/browser': 'src/adapter/browser.ts',
        'adapter/node': 'src/adapter/node.ts',
        'adapter/deno': 'src/adapter/deno.ts',
      },
      formats: ["es"],
    },
    outDir: "lib",
  },
  plugins: [
    tsconfigPaths(),
    dts({
      outDir: "lib",
      tsconfigPath: "tsconfig.build.json",
      copyDtsFiles: true,
    }),
  ],
  test: {
    coverage: {
      provider: "istanbul", // use istanbul for browser coverage
      include: ["src/**/*.ts"],
    },
    // alias: {
    //   'ts-graphviz': './src/tsgraphviz.ts',
    //   "#test/*": "./test/*/index.ts",
    //   "ts-graphviz/ast": "./src/ast.ts",
    //   "ts-graphviz/adapter": "./src/adapter.ts"
    // }
  },
});
