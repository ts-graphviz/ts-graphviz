import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { renderHTMLLike } from '@ts-graphviz/react';
import { digraph } from 'ts-graphviz';

interface Manifest {
  name: string;
  description?: string;
  private?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

// The published packages are the directories of packages/ (the other
// workspace packages are private). Read from the file system rather than
// `pnpm list`, so that loading this module starts no process.
const packagesDir = join(import.meta.dirname, '..', 'packages');
const workspaceDirs = readdirSync(packagesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => ({ path: join(packagesDir, entry.name) }))
  .sort((a, b) => a.path.localeCompare(b.path));

const publishedPackages = workspaceDirs
  .map(
    ({ path }) =>
      JSON.parse(readFileSync(join(path, 'package.json'), 'utf8')) as Manifest,
  )
  .filter((manifest) => manifest.private !== true)
  .map((manifest) => ({ manifest }));

const publishedNames = new Set(
  publishedPackages.map(({ manifest }) => manifest.name),
);

/**
 * Names of published workspace packages that `manifest` depends on at runtime.
 * devDependencies are left out: they only serve the package's own tests.
 */
function workspaceDependencies(manifest: Manifest): string[] {
  return [
    ...new Set(
      [
        manifest.dependencies,
        manifest.optionalDependencies,
        manifest.peerDependencies,
      ].flatMap((deps) => Object.keys(deps ?? {})),
    ),
  ].filter((name) => publishedNames.has(name));
}

function PackageLabel({
  name,
  description,
}: {
  name?: string;
  description?: string;
}) {
  return (
    <dot:table>
      <dot:tr>
        <dot:td port="name" bgcolor="#f0f0f0" align="CENTER">
          {String(name || 'Unknown')}
        </dot:td>
      </dot:tr>
      <dot:tr>
        <dot:td port="description" align="CENTER">
          {String(description || 'No description')}
        </dot:td>
      </dot:tr>
    </dot:table>
  );
}

export default digraph('dependency_graph', (g) => {
  g.set('newrank', true);
  g.set('rankdir', 'LR');

  g.node({ shape: 'none' });
  g.edge({ dir: 'back' });

  for (const pkg of publishedPackages) {
    g.node(pkg.manifest.name, {
      label: renderHTMLLike(
        <PackageLabel
          name={pkg.manifest.name}
          description={pkg.manifest.description}
        />,
      ),
      URL: `https://www.npmjs.com/package/${pkg.manifest.name}`,
    });
  }

  for (const { manifest } of publishedPackages) {
    for (const depName of workspaceDependencies(manifest)) {
      g.edge([depName, manifest.name]);
    }
  }
});
