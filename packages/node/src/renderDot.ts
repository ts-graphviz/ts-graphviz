import cp from 'child_process';
import { IRootCluster, toDot } from 'ts-graphviz';
import { ExecuteOption } from './types';

/**
 * Run dot command and output result to the specified path.
 *
 * @deprecated
 * Please understand the disadvantages before using it because it uses a blocking API.
 * This API is not maintained and will be removed in the future.
 *
 * ```ts
 * import path from "path";
 * import { digraph, attribute } from "ts-graphviz";
 * import { renderDot } from "@ts-graphviz/node";
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
 * renderDot(G, {
 *   format: "svg",
 *   output: path.resolve(__dirname, "./callback.svg"),
 * });
 * ```
 */
export function renderDot(
  dot: IRootCluster | string,
  { format = 'png', output = undefined, dotCommand = 'dot' }: ExecuteOption = {},
): Buffer {
  const input = typeof dot === 'string' ? dot : toDot(dot);
  const args = [dotCommand, `-T${format}`];
  if (typeof output === 'string') {
    args.push('-o', output);
  }
  return cp.execFileSync(dotCommand, args, {
    stdio: 'pipe',
    input,
  });
}
