// Attach the published npm tarballs and their provenance to the GitHub
// Releases that changesets created, so that releases carry verifiable assets.
//
//   node release-assets.mjs download <dir>          (needs PUBLISHED_PACKAGES)
//   node release-assets.mjs upload <dir> <bundle>   (needs PUBLISHED_PACKAGES, GH_TOKEN)
//
// PUBLISHED_PACKAGES is the `publishedPackages` output of changesets/action:
// a JSON array of { name, version }. Commands are run without a shell.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [command, dir, bundle] = process.argv.slice(2);
const packages = JSON.parse(process.env.PUBLISHED_PACKAGES ?? '[]');
const NAME = /^(@[a-z0-9-]+\/)?[a-z0-9][a-z0-9._-]*$/;
const VERSION = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

for (const { name, version } of packages) {
  if (!NAME.test(name) || !VERSION.test(version)) {
    throw new Error(`Unexpected package: ${name}@${version}`);
  }
}

/** The tarball name npm pack gives a package. */
const tarball = (name, version) =>
  `${name.replace(/^@/, '').replace('/', '-')}-${version}.tgz`;

if (command === 'download') {
  mkdirSync(dir, { recursive: true });
  for (const { name, version } of packages) {
    // The tarball as the registry serves it, so the attestation names the
    // digest users download.
    execFileSync(
      'npm',
      ['pack', `${name}@${version}`, '--pack-destination', dir],
      {
        stdio: 'inherit',
      },
    );
  }
} else if (command === 'upload') {
  for (const { name, version } of packages) {
    const file = join(dir, tarball(name, version));
    const signature = `${file}.sigstore.json`;
    copyFileSync(bundle, signature);
    execFileSync(
      'gh',
      ['release', 'upload', `${name}@${version}`, file, signature, '--clobber'],
      { stdio: 'inherit' },
    );
  }
} else {
  throw new Error(`Unknown command: ${command}`);
}
