import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { getDts } from 'dts-extractor';

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    output: {
      short: 'o',
      type: 'string',
      description: 'Output file path',
    },
  },
});

const dts = await getDts({
  nodeModulesPath: './node_modules',
  packages: [
    'ts-graphviz',
    '@ts-graphviz/adapter',
    '@ts-graphviz/ast',
    '@ts-graphviz/common',
    '@ts-graphviz/core',
    '@ts-graphviz/ast',
  ],
});

await writeFile(
  resolve(process.cwd(), values.output),
  `${JSON.stringify(
    Object.entries(dts).map(([key, value]) => ({
      filePath: `file:///${key}`,
      content: value,
    })),
  )}\n`,
  {},
);
