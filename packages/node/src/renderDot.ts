import cp from 'child_process';
import { IRootCluster, toDot } from 'ts-graphviz';

export type Fromat = 'png' | 'svg' | 'json' | 'jpg' | 'pdf' | 'xdot';

export type RenderDotOption = {
  format?: Fromat;
  output?: string;
  dotCommand?: string;
};

/**
 * Run dot command and output result to the specified path.
 *
 * ```ts
 * import path from "path";
 * import { digraph, attribute, renderDot } from "ts-graphviz";
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
  { format = 'png', output = undefined, dotCommand = 'dot' }: RenderDotOption = {},
): Buffer {
  const input = typeof dot === 'string' ? dot : toDot(dot);
  const cmd = [dotCommand, `-T${format}`];
  if (typeof output === 'string') {
    cmd.push('-o', output);
  }
  return cp.execSync(cmd.join(' '), {
    stdio: 'pipe',
    input,
  });
}
