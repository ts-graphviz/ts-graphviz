import { writeFile } from 'node:fs/promises';
import { Graph } from 'ts-graphviz';
import { exportToBuffer } from '@ts-graphviz/node';
import { optimize, OptimizedSvg } from 'svgo';


export async function writeGraph(graph: Graph, filepath: string) {
  const svg = await exportToBuffer(graph, { format: 'svg' });
  const result = optimize(svg);
  if (result.error !== undefined) {
    throw new Error(result.error);
  }
  await writeFile(filepath, (result as OptimizedSvg).data);
}
