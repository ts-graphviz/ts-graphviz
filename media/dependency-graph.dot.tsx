import { findWorkspacePackages } from '@pnpm/workspace.find-packages';
import { createPkgGraph } from '@pnpm/workspace.pkgs-graph';

import { DOT, renderHTMLLike } from '@ts-graphviz/react';
import { digraph } from 'ts-graphviz';

const workspacePackages = await findWorkspacePackages(process.cwd());

const publishedPackages = workspacePackages.filter(
  (pkg) => pkg.manifest.private !== true,
);

const map = new Map<string, string>();
for (const pkg of publishedPackages) {
  map.set(pkg.dir, pkg.manifest.name as string);
}
const pkgGraph = createPkgGraph(publishedPackages);

function PackageLabel({
  name,
  description,
}: { name?: string; description?: string }) {
  return (
    <DOT.TABLE>
      <DOT.TR>
        <DOT.TD PORT="name" BGCOLOR="#f0f0f0" ALIGN="CENTER">
          {name}
        </DOT.TD>
      </DOT.TR>
      <DOT.TR>
        <DOT.TD PORT="description" ALIGN="CENTER">
          {description}
        </DOT.TD>
      </DOT.TR>
    </DOT.TABLE>
  );
}

export default digraph('dependency_graph', (g) => {
  g.set('newrank', true);
  g.set('rankdir', 'LR');

  g.node({ shape: 'none' });
  g.edge({ dir: 'back' });

  for (const pkg of publishedPackages) {
    g.node(pkg.manifest.name as string, {
      label: renderHTMLLike(
        <PackageLabel
          name={pkg.manifest.name}
          description={pkg.manifest.description}
        />,
      ),
      URL: `https://www.npmjs.com/package/${pkg.manifest.name}`,
    });
  }

  for (const [pkgDir, pkg] of Object.entries(pkgGraph.graph)) {
    for (const depDir of pkg.dependencies) {
      const pkgName = map.get(pkgDir) as string;
      const depName = map.get(depDir) as string;
      g.edge([depName, pkgName]);
    }
  }
});
