import { resolve } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { Graph } from 'ts-graphviz';
import { exportToBuffer } from '@ts-graphviz/node';
import { optimize, OptimizedSvg } from 'svgo';


interface Setting {
  mod: Promise<{ default: Graph}>;
  output: string;
}

export async function writeGraph(graph: Graph, filepath: string) {
  const svg = await exportToBuffer(graph, { format: 'svg' });
  const result = optimize(svg);
  if (result.error !== undefined) {
    throw new Error(result.error);
  }
  await writeFile(filepath, (result as OptimizedSvg).data);
}

const settings: Setting[] = [
  {
    mod: import('../examples/state-machine.js'),
    output: resolve(process.cwd(), './packages/parser/img/state-machine.svg'),
  },
  {
    mod: import('../examples/package-dependencies.js'),
    output: resolve(process.cwd(), './img/packages-dependency.svg'),
  },
];

await Promise.all(
  settings.map(async ({ mod, output }) => {
    const { default: graph } = await mod;
    return writeGraph(graph, output);
  }),
);
