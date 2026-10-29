/**
 * Run the tests tagged `process` (they start Graphviz, a stand-in command or
 * Biome) in a container, away from the developer's environment, network and
 * home directory. `pnpm test` leaves those tests out.
 *
 *   pnpm test:sandbox [vitest arguments, e.g. test/differential]
 *
 * The container is started with plain `podman run` or `docker run`:
 * CONTAINER_RUNTIME=podman|docker picks one; otherwise Podman when it can
 * start a container with the sandbox options (it runs rootless by default),
 * else Docker. The image (test/sandbox/
 * Dockerfile) is Node.js of the same major version as the Node.js running
 * this script, plus Graphviz. The repository is mounted read-only with the
 * node_modules installed on the host, so this needs a Linux host on the
 * architecture the dependencies were installed for.
 *
 * Only an allowlist of variables reaches the tests: PATH, HOME=/tmp,
 * TMPDIR=/tmp, LANG, and CI, TZ, FC_NUM_RUNS, FC_SEED when they are set;
 * FORCE_COLOR=1 when the output is a terminal (the container has none).
 *
 * Read-only is not private: what the tests can read, they can print. So
 * `.git` and every top-level entry git does not track (`.env`, notes,
 * caches), except node_modules, is hidden behind an empty mount.
 *
 * The run is stopped (and its container removed) after
 * SANDBOX_TIMEOUT_MINUTES, 30 by default.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
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

/** `.git` and the top-level entries git does not track, but node_modules. */
function untracked() {
  const listed = spawnSync('git', ['ls-files', '-z'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    timeout: 60_000,
  });
  if (listed.status !== 0) {
    fail(`\`git ls-files\` failed: ${listed.stderr?.trim() ?? listed.error}`);
  }
  const tracked = new Set(
    listed.stdout
      .split('\0')
      .filter(Boolean)
      .map((path) => path.split('/')[0]),
  );
  return readdirSync(root, { withFileTypes: true }).filter(
    (entry) => !tracked.has(entry.name) && entry.name !== 'node_modules',
  );
}
const hide = untracked();

/**
 * Mounts that hide those entries: an empty tmpfs over a directory,
 * /dev/null over a file.
 */
function hidden(runtime: string): string[] {
  return hide.flatMap((entry) =>
    entry.isDirectory()
      ? [
          '--tmpfs',
          // Podman would copy the directory's files into the tmpfs.
          `/repo/${entry.name}:ro,size=4k,mode=0555${runtime === 'podman' ? ',notmpcopyup' : ''}`,
        ]
      : [
          '--mount',
          `type=bind,source=/dev/null,target=/repo/${entry.name},readonly`,
        ],
  );
}

const uid = process.getuid?.() ?? 1000;
const gid = process.getgid?.() ?? 1000;

/** The `run` options that make the sandbox. */
const sandbox = (runtime: string) => [
  'run',
  '--rm',
  // An init process as PID 1 reaps orphans (e.g. a stand-in's children).
  '--init',
  '--network',
  'none',
  '--read-only',
  // Podman would add writable tmpfs mounts (/run, /var/tmp) to --read-only.
  ...(runtime === 'podman' ? ['--read-only-tmpfs=false'] : []),
  // The only writable place; stand-in commands are written to and run
  // from it, so it is not noexec.
  '--tmpfs',
  '/tmp:rw,exec,nosuid,nodev,size=1g,mode=1777',
  '--mount',
  `type=bind,source=${root},target=/repo,readonly`,
  ...hidden(runtime),
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
  // The image's own entrypoint is not run.
  '--entrypoint',
  'env',
  image,
];

/**
 * Makes `runtime` ready: the image built and a container with the sandbox
 * options started once. Returns what went wrong, if anything.
 */
function prepare(runtime: string): string | undefined {
  const info = spawnSync(runtime, ['info'], {
    stdio: 'ignore',
    timeout: 60_000,
  });
  if (info.status !== 0) {
    return `\`${runtime} info\` failed: not installed, or not running`;
  }
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
    if (build.status !== 0) return `building ${image} failed`;
  }
  // Graphviz must be there (without it, the tests that need it skip), and
  // what is hidden must read empty.
  const script = [
    'dot -V || exit 1',
    'for p; do',
    '  if [ -d "$p" ]; then [ -z "$(ls -A "$p")" ]; else [ ! -s "$p" ]; fi ||',
    '    { echo "$p is not hidden" >&2; exit 1; }',
    'done',
  ].join('\n');
  const paths = hide.map((entry) => `/repo/${entry.name}`);
  const check = spawnSync(
    runtime,
    [...sandbox(runtime), 'sh', '-c', script, 'sh', ...paths],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'ignore', 'pipe'],
      timeout: 120_000,
    },
  );
  if (check.status !== 0) {
    return `a container with the sandbox options did not start: ${check.stderr.trim()}`;
  }
  return undefined;
}

const requested = process.env.CONTAINER_RUNTIME;
if (requested !== undefined && !['podman', 'docker'].includes(requested)) {
  fail(`CONTAINER_RUNTIME must be podman or docker, not ${requested}`);
}
const started = Date.now();
const problems: string[] = [];
const runtime = (requested ? [requested] : ['podman', 'docker']).find(
  (candidate) => {
    const problem = prepare(candidate);
    if (problem !== undefined) problems.push(`${candidate}: ${problem}`);
    return problem === undefined;
  },
);
if (runtime === undefined) {
  fail(
    `${requested ? `${requested} cannot` : 'neither Podman nor Docker can'} run the sandbox.\n  ${problems.join('\n  ')}\nInstall and start Podman or Docker to run the tests tagged process; \`pnpm test\` runs the others.`,
  );
}
// Say why a runtime was passed over.
for (const problem of problems) console.log(`test:sandbox: ${problem}`);
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

const minutes = Number(process.env.SANDBOX_TIMEOUT_MINUTES ?? 30);
if (!(minutes > 0)) fail('SANDBOX_TIMEOUT_MINUTES must be a positive number');
const name = `ts-graphviz-test-sandbox-${process.pid}`;
const args = process.argv.slice(2).filter((arg) => arg !== '--');
const run = spawnSync(
  runtime,
  [
    'run',
    '--name',
    name,
    ...sandbox(runtime).slice(1),
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
  { stdio: 'inherit', timeout: minutes * 60_000, killSignal: 'SIGKILL' },
);
if (run.status === null) {
  // Timed out (or the client was killed): the container may still run.
  spawnSync(runtime, ['rm', '--force', name], {
    stdio: 'ignore',
    timeout: 60_000,
  });
  console.error(
    `test:sandbox: stopped ${run.error ? `after ${minutes} min` : `by ${run.signal}`}`,
  );
}
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;
console.log(
  `test:sandbox: ${runtime}, Node.js ${nodeMajor}; preparing ${seconds(built - started)}, tests ${seconds(Date.now() - built)}`,
);
process.exit(run.status ?? 1);
