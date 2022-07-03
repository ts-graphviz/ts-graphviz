// node scripts/packages.js | dot -Tpng -o scripts/packages.png
import { resolve } from 'node:path';
import { strict } from 'ts-graphviz';
import { writeGraph } from './utils/write-graph.js';

const pkgs = {
  graphviz: 'ts-graphviz',
  type: '@ts-graphviz/dot-type',
  attribute: '@ts-graphviz/dot-attribute',
  ast: '@ts-graphviz/dot-ast',
  node: '@ts-graphviz/node',
  react: '@ts-graphviz/react',
  renderer: '@ts-graphviz/renderer',
  parser: '@ts-graphviz/parser',
  model: '@ts-graphviz/model',
};

const dependencies: { [key: string]: string[]} = {
  [pkgs.attribute]: [pkgs.type],
  [pkgs.ast]: [pkgs.attribute, pkgs.type],
  [pkgs.renderer]: [pkgs.ast, pkgs.type, pkgs.attribute],
  [pkgs.model]: [pkgs.attribute, pkgs.ast],
  [pkgs.parser]: [pkgs.ast],
  [pkgs.graphviz]: [pkgs.ast, pkgs.attribute, pkgs.type, pkgs.model, pkgs.renderer, pkgs.parser],
  [pkgs.node]: [pkgs.graphviz],
  [pkgs.react]: [pkgs.graphviz],
};


const outputFile = resolve(process.cwd(), process.argv[2]);

await writeGraph(
  strict.digraph((g) => {
    g.set('layout', 'circo');
    g.node({
      shape: 'ellipse',
    });
    g.edge({
      dir: 'back',
    });

    for (const [src, dists] of Object.entries(dependencies)) {
      for (const dist of dists) {
        g.edge([dist, src]);

      }
    }
  }),
  outputFile,
);
