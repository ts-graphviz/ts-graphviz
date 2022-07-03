import { resolve } from 'node:path';
import { digraph } from 'ts-graphviz';
import { writeGraph } from './utils/write-graph.js';


const outputFile = resolve(process.cwd(), process.argv[2]);

await writeGraph(
  digraph((g) => {
    g.node({
      shape: 'circle',
      width: 1.5,
    });

    g.subgraph({ rank: 'same' }, (sub) => {
      sub.node('AST');
      sub.node('Model');
    });
    g.edge(['DOT', 'AST'], {
      label: 'AST.paese',
    });
    g.edge(['AST', 'DOT'], {
      label: 'AST.stringify',
    });
    g.edge(['AST', 'Model'], {
      label: 'convert',
    });
    g.edge(['DOT', 'Model'], {
      label: 'paese/dot',
    });
    g.edge(['Model', 'DOT'], {
      label: 'toDot',
    });
  }),
  outputFile,
);
