/**
 * Fetch the Graphviz attribute documentation sources and store a snapshot
 * under `graphviz-docs/`.
 *
 * The attribute docs live in the Graphviz website repository
 * (https://gitlab.com/graphviz/graphviz.gitlab.io) as Markdown files with
 * YAML front matter. This script downloads `content/en/docs` at the commit
 * recorded in `graphviz-docs/source.json` (or the ref given with `--ref`),
 * extracts the front matter of every attribute and attribute type, and
 * writes them as JSON. `generate-attributes.ts` then works offline from that
 * snapshot, so `pnpm codegen` needs no network access.
 *
 * Usage:
 *   node scripts/fetch-graphviz-docs.ts            # re-fetch the pinned commit
 *   node scripts/fetch-graphviz-docs.ts --ref main # move the pin to a ref
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const PROJECT = 'graphviz/graphviz.gitlab.io';
const DOCS_PATH = 'content/en/docs';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'graphviz-docs');
const sourcePath = join(outDir, 'source.json');

interface Source {
  repository: string;
  ref: string;
  fetchedAt: string;
}

interface AttributeDefault {
  default: string;
  for?: string;
}

export interface AttributeDoc {
  name: string;
  description: string;
  /** Markdown body of the doc page (Hugo shortcodes included). */
  body: string;
  /** Graphviz value type names, e.g. `["double"]` or `["color", "colorList"]`. */
  types: string[];
  /** Objects the attribute applies to: E (edge), N (node), G (graph), C (cluster), S (subgraph). */
  usedBy: string[];
  defaults: AttributeDefault[];
  minimums: string[];
  /** Layout engines / output formats the attribute is restricted to, e.g. `["dot"]`. */
  flags: string[];
}

export interface AttributeTypeDoc {
  name: string;
  description: string;
}

// --- tar -------------------------------------------------------------------

interface TarEntry {
  name: string;
  data: Uint8Array;
}

function* readTar(buf: Uint8Array): Generator<TarEntry> {
  const text = new TextDecoder();
  const field = (off: number, start: number, len: number) =>
    text
      .decode(buf.subarray(off + start, off + start + len))
      .replace(/\0.*$/s, '');
  let off = 0;
  let longName: string | undefined;
  while (off + 512 <= buf.length) {
    const name = field(off, 0, 100);
    if (name === '') break; // end-of-archive blocks
    const size = Number.parseInt(field(off, 124, 12).trim() || '0', 8);
    const type = field(off, 156, 1);
    const prefix = field(off, 345, 155);
    const data = buf.subarray(off + 512, off + 512 + size);
    off += 512 + Math.ceil(size / 512) * 512;
    if (type === 'L') {
      longName = text.decode(data).replace(/\0.*$/s, '');
      continue;
    }
    const fullName = longName ?? (prefix ? `${prefix}/${name}` : name);
    longName = undefined;
    if (type === '0' || type === '') yield { name: fullName, data };
  }
}

// --- front matter ------------------------------------------------------------
// The docs use a small, regular subset of YAML; parse just that.

type Scalar = string;
type Value = Scalar | Scalar[] | Record<string, Scalar>[];

function unquote(s: string): string {
  const t = s.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1).replace(/''/g, "'");
  }
  return t;
}

function parseFrontMatter(src: string): {
  meta: Record<string, Value>;
  body: string;
} {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(src);
  if (!m) throw new Error('missing front matter');
  const meta: Record<string, Value> = {};
  const lines = m[1].split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const kv = /^(\w+):(.*)$/.exec(line);
    if (!kv) throw new Error(`unexpected front matter line: ${line}`);
    const [, key, rest] = kv;
    if (rest.trim() !== '') {
      // plain scalar; a continuation line is indented and folded with a space
      let value = rest.trim();
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) {
        value += ` ${lines[++i].trim()}`;
      }
      meta[key] = value === '[]' ? [] : unquote(value);
      continue;
    }
    // block list
    const items: Scalar[] = [];
    const maps: Record<string, Scalar>[] = [];
    while (i + 1 < lines.length && /^(- | {2})/.test(lines[i + 1])) {
      const item = lines[++i];
      const mapStart = /^- (\w+): (.*)$/.exec(item);
      if (mapStart) {
        const obj: Record<string, Scalar> = {
          [mapStart[1]]: unquote(mapStart[2]),
        };
        while (i + 1 < lines.length && /^ {2}\w+: /.test(lines[i + 1])) {
          const [, k, v] = /^ {2}(\w+): (.*)$/.exec(
            lines[++i],
          ) as RegExpExecArray;
          obj[k] = unquote(v);
        }
        maps.push(obj);
      } else {
        items.push(unquote(item.replace(/^- /, '')));
      }
    }
    meta[key] = maps.length ? maps : items;
  }
  return { meta, body: m[2].trim() };
}

// --- main ----------------------------------------------------------------------

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : process.argv[i + 1];
}

const source: Source = JSON.parse(readFileSync(sourcePath, 'utf8'));
const ref = arg('--ref') ?? source.ref;
const archive = arg('--archive');

async function download(url: string): Promise<Uint8Array> {
  // GitLab occasionally answers archive requests with 406/429; retry with backoff.
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, {
      headers: {
        accept: 'application/octet-stream',
        'user-agent': 'ts-graphviz codegen',
      },
    });
    if (res.ok) return new Uint8Array(await res.arrayBuffer());
    if (attempt >= 5 || ![406, 429, 502, 503].includes(res.status)) {
      throw new Error(`${res.status} ${res.statusText} for ${url}`);
    }
    const wait = 2 ** attempt * 1000;
    console.log(
      `  ${res.status} ${res.statusText}; retrying in ${wait / 1000}s`,
    );
    await new Promise((r) => setTimeout(r, wait));
  }
}

let tgz: Uint8Array;
if (archive) {
  console.log(`Reading ${archive}`);
  tgz = new Uint8Array(readFileSync(archive));
} else {
  const url = `https://gitlab.com/api/v4/projects/${encodeURIComponent(PROJECT)}/repository/archive.tar.gz?sha=${encodeURIComponent(ref)}&path=${DOCS_PATH}`;
  console.log(`Fetching ${PROJECT}@${ref} (${DOCS_PATH})`);
  tgz = await download(url);
}
const tar = gunzipSync(tgz);

const attrs: AttributeDoc[] = [];
const attrTypes: AttributeTypeDoc[] = [];
let commit: string | undefined;
for (const entry of readTar(tar)) {
  // top-level dir is `<project>-<ref>-<sha>-<path>/`
  const [top, ...rest] = entry.name.split('/');
  commit ??= /-([0-9a-f]{40})-/.exec(top)?.[1];
  const rel = rest.join('/');
  const isAttr = rel.startsWith(`${DOCS_PATH}/attrs/`);
  const isType = rel.startsWith(`${DOCS_PATH}/attr-types/`);
  if (
    !(isAttr || isType) ||
    !rel.endsWith('.md') ||
    rel.endsWith('/_index.md')
  ) {
    continue;
  }
  let parsed: ReturnType<typeof parseFrontMatter>;
  try {
    parsed = parseFrontMatter(new TextDecoder().decode(entry.data));
  } catch (e) {
    throw new Error(`${rel}: ${(e as Error).message}`, { cause: e });
  }
  const { meta, body } = parsed;
  if (process.env.DEBUG_FETCH) console.log(rel, JSON.stringify(meta));
  const required = (key: string): string => {
    const value = meta[key];
    if (typeof value !== 'string' || value === '') {
      throw new Error(`${rel}: front matter is missing "${key}"`);
    }
    return value;
  };
  const name = required('title');
  if (isAttr) {
    attrs.push({
      name,
      description: String(meta.description ?? ''),
      body,
      types: (meta.types ?? []) as string[],
      usedBy: [...required('used_by')],
      // some pages (e.g. rank) omit keys that are empty
      defaults: (
        (meta.defaults ?? []) as (Scalar | Record<string, Scalar>)[]
      ).map(
        (d): AttributeDefault =>
          typeof d === 'string'
            ? { default: d }
            : { default: d.default, ...(d.for ? { for: d.for } : {}) },
      ),
      minimums: (meta.minimums ?? []) as string[],
      flags: (meta.flags ?? []) as string[],
    });
  } else {
    attrTypes.push({ name, description: String(meta.description ?? '') });
  }
}
if (!commit)
  throw new Error('could not determine the commit sha from the archive');

const byName = <T extends { name: string }>(a: T, b: T) =>
  a.name.localeCompare(b.name, 'en');
attrs.sort(byName);
attrTypes.sort(byName);

mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, 'attrs.json'),
  `${JSON.stringify(attrs, null, 2)}\n`,
);
writeFileSync(
  join(outDir, 'attr-types.json'),
  `${JSON.stringify(attrTypes, null, 2)}\n`,
);
writeFileSync(
  sourcePath,
  `${JSON.stringify(
    {
      repository: PROJECT,
      ref: commit,
      fetchedAt: new Date().toISOString().slice(0, 10),
    } satisfies Source,
    null,
    2,
  )}\n`,
);
console.log(
  `Wrote ${attrs.length} attributes and ${attrTypes.length} attribute types at ${commit.slice(0, 12)}`,
);
