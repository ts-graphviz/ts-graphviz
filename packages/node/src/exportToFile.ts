import { IRootCluster, toDot } from 'ts-graphviz';
import { DotOption, ExecuteDotOption, OutputOption } from './types';
import { executeDot } from './executeDot';

/**
 * Export the file by giving a dot.
 *
 * ```ts
 * import path from "path";
 * import { digraph, attribute } from "ts-graphviz";
 * import { exportToFile } from "@ts-graphviz/node";
 *
 * const G = digraph("G", (g) => {
 *   const a = g.node("aa");
 *   const b = g.node("bb");
 *   const c = g.node("cc");
 *   g.edge([a, b, c], {
 *     [attribute.color]: "red",
 *   });
 *   g.subgraph("A", (A) => {
 *     const Aa = A.node("Aaa", {
 *       [attribute.color]: "pink",
 *     });
 *     const Ab = A.node("Abb", {
 *       [attribute.color]: "violet",
 *     });
 *     const Ac = A.node("Acc");
 *     A.edge([Aa.port({ compass: "c" }), Ab, Ac, "E"], {
 *       [attribute.color]: "red",
 *     });
 *   });
 * });
 *
 * await exportToFile(G, {
 *  format: "svg",
 *  output: path.resolve(__dirname, "./callback.svg"),
 * });
 * ```
 */
export async function exportToFile(
  dot: IRootCluster | string,
  options: Required<OutputOption> & ExecuteDotOption & DotOption,
): Promise<void> {
  const input = typeof dot === 'string' ? dot : toDot(dot);
  await executeDot(input, options);
}
