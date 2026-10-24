import TSGraphvizPreviewEditor from '@site/src/components/TSGraphvizPreviewEditor';
import Layout from '@theme/Layout';

import { translate } from '@docusaurus/Translate';
import styles from './styles.module.css';

const script = `import { digraph, attribute as _ } from 'ts-graphviz';

digraph('state_machine', { [_.newrank]: true }, (g) => {
  g.node({ shape: 'circle' });

  g.edge(['Model', 'DOT'], { [_.label]: 'toDot', [_.constraint]: false });
  g.edge(['AST', 'DOT'], { [_.label]: 'stringify' });
  g.edge(['DOT', 'AST'], { [_.label]: 'parse' });
  g.edge(['Model', 'AST'], { [_.label]: 'fromModel' });
  g.edge(['AST', 'Model'], { [_.label]: 'toModel' });
  g.edge(['DOT', 'Model'], { [_.label]: 'fromDot', [_.constraint]: false });
});
`;

export default function Editor(): JSX.Element {
  return (
    <Layout
      title={translate({
        id: 'playground.title',
        message: 'Interactive Playground - Visualize Graphs in Your Browser',
      })}
      description={translate({
        id: 'playground.description',
        message:
          'Explore the ts-graphviz Playground to write and visualize Graphviz graphs interactively online. Build, edit, and render graphs using TypeScript/JavaScript directly in your browser—no installation needed.',
      })}
    >
      <main className={styles.main}>
        <TSGraphvizPreviewEditor script={script} className={styles.editor} />
      </main>
    </Layout>
  );
}
