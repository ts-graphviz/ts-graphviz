import fs from 'fs';
import path from 'path';
import util from 'util';
import { digraph, RootCluster } from 'ts-graphviz';
import { exportToBuffer } from '@ts-graphviz/node';
import { optimize } from 'svgo';

const writeFile = util.promisify(fs.writeFile);

async function injectStateMachineDiagram(G: RootCluster, filepath: string) {
  const svg = await exportToBuffer(G, { format: 'svg' }).then((buf) => buf.toString('utf-8'));
  const { data } = optimize(svg);

  await writeFile(filepath, data);
}

(async () => {
  await injectStateMachineDiagram(
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
    path.resolve(__dirname, '../img/state-machine.svg'),
  );
})();
