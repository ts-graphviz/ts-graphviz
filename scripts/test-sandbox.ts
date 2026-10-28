/**
 * Run the tests tagged `process` (they start Graphviz, a stand-in command or
 * Biome) in a container, away from the developer's environment, network and
 * home directory. `pnpm test` leaves those tests out.
 *
 *   pnpm test:sandbox [vitest arguments, e.g. test/differential]
 *
 * The container is started with plain `podman run` or `docker run`:
 * CONTAINER_RUNTIME=podman|docker picks one; otherwise Podman when it works
 * (it runs rootless by default), else Docker. The image (test/sandbox/
 * Dockerfile) is Node.js of the same major version as the Node.js running
 * this script, plus Graphviz. The repository is mounted read-only with the
 * node_modules installed on the host, so this needs a Linux host on the
 * architecture the dependencies were installed for.
 *
 * Only an allowlist of variables reaches the tests: PATH, HOME=/tmp,
 * TMPDIR=/tmp, LANG, and CI, TZ, FC_NUM_RUNS, FC_SEED when they are set.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

function fail(message: string): never {
  console.error(`test:sandbox: ${message}`);
  process.exit(1);
}

// pnpm is a `.cmd` shim on Windows, which needs a shell to run
const shell = process.platform === 'win32';

if (process.platform !== 'linux') {
  fail(
    `needs a Linux host (this is ${process.platform}): the container uses the node_modules installed here. On other systems, run the tests from a Linux machine or a Linux CI job.`,
  );
}

const works = (runtime: string) =>
  spawnSync(runtime, ['version'], { stdio: 'ignore', timeout: 30_000 })
    .status === 0;
const requested = process.env.CONTAINER_RUNTIME;
if (requested !== undefined && !['podman', 'docker'].includes(requested)) {
  fail(`CONTAINER_RUNTIME must be podman or docker, not ${requested}`);
}
const runtime =
  requested ?? ['podman', 'docker'].find((candidate) => works(candidate));
if (runtime === undefined) {
  fail(
    'neither Podman nor Docker is installed and usable (`podman version` and `docker version` failed). Install one of them to run the tests tagged process; `pnpm test` runs the others.',
  );
}
if (requested !== undefined && !works(runtime)) {
  fail(`\`${runtime} version\` failed: is ${runtime} installed and running?`);
}

if (!existsSync(join(root, 'node_modules', 'vitest'))) {
  fail('no node_modules: run `pnpm install` first');
}
// The parser is generated; the repository is read-only in the container.
if (!existsSync(join(root, 'packages/ast/src/dot-shim/parser/_parse.js'))) {
  console.log('test:sandbox: generating the parser (pnpm codegen)');
  const codegen = spawnSync('pnpm', ['codegen'], {
    cwd: root,
    stdio: 'inherit',
    shell,
  });
  if (codegen.status !== 0) fail('`pnpm codegen` failed');
}

const nodeMajor = process.versions.node.split('.')[0];
const supported = ['22', '24', '26'];
if (!supported.includes(nodeMajor)) {
  fail(
    `no sandbox image for Node.js ${nodeMajor} (test/sandbox/Dockerfile has ${supported.join(', ')})`,
  );
}
// Tagged with the Dockerfile's hash: built once per change of it.
const context = join(root, 'test', 'sandbox');
const hash = createHash('sha256')
  .update(readFileSync(join(context, 'Dockerfile')))
  .digest('hex')
  .slice(0, 12);
const image = `localhost/ts-graphviz-test-sandbox:node${nodeMajor}-${hash}`;

const started = Date.now();
const exists =
  spawnSync(runtime, ['image', 'inspect', image], { stdio: 'ignore' })
    .status === 0;
if (!exists) {
  console.log(`test:sandbox: building ${image} with ${runtime}`);
  const build = spawnSync(
    runtime,
    [
      'build',
      '--quiet',
      '--build-arg',
      `NODE_MAJOR=${nodeMajor}`,
      '--tag',
      image,
      context,
    ],
    { stdio: ['ignore', 'ignore', 'inherit'] },
  );
  if (build.status !== 0) fail(`building ${image} with ${runtime} failed`);
}
const built = Date.now();

// The variables the tests get, and nothing else (`env -i`).
const env = [
  'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
  'HOME=/tmp',
  'TMPDIR=/tmp',
  'LANG=C.UTF-8',
  ...['CI', 'TZ', 'FC_NUM_RUNS', 'FC_SEED']
    .filter((name) => process.env[name] !== undefined)
    .map((name) => `${name}=${process.env[name]}`),
  ...(process.stdout.isTTY ? ['FORCE_COLOR=1'] : []),
];

const uid = process.getuid?.() ?? 1000;
const gid = process.getgid?.() ?? 1000;
const args = process.argv.slice(2).filter((arg) => arg !== '--');
const run = spawnSync(
  runtime,
  [
    'run',
    '--rm',
    // An init process as PID 1 reaps orphans (e.g. a stand-in's children).
    '--init',
    '--network',
    'none',
    '--read-only',
    // The only writable place; stand-in commands are written to and run
    // from it, so it is not noexec.
    '--tmpfs',
    '/tmp:rw,exec,nosuid,nodev,size=1g,mode=1777',
    '--mount',
    `type=bind,source=${root},target=/repo,readonly`,
    '--workdir',
    '/repo',
    '--user',
    `${uid}:${gid}`,
    // Rootless Podman: the same uid inside as outside, to read the files.
    ...(runtime === 'podman' ? ['--userns', 'keep-id'] : []),
    '--cap-drop',
    'ALL',
    '--security-opt',
    'no-new-privileges',
    '--pids-limit',
    '512',
    '--memory',
    '4g',
    '--memory-swap',
    '4g',
    image,
    'env',
    '-i',
    ...env,
    'node',
    'node_modules/vitest/vitest.mjs',
    'run',
    '--tags-filter=process',
    // Both write into the (read-only) repository; type tests are not
    // process tests and run with `pnpm test`.
    '--coverage.enabled=false',
    '--typecheck.enabled=false',
    '--configLoader=runner',
    ...args,
  ],
  { stdio: 'inherit' },
);
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;
console.log(
  `test:sandbox: ${runtime}, Node.js ${nodeMajor}; image ${seconds(built - started)}, tests ${seconds(Date.now() - built)}`,
);
process.exit(run.status ?? 1);
