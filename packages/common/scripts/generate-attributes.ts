/**
 * Generate `src/attributes/attribute.ts` from the Graphviz documentation snapshot in
 * `graphviz-docs/attrs.json` (see `fetch-graphviz-docs.ts`).
 *
 * The output keeps the structure that user code can augment (see the
 * "Extending the Type System" section of the ts-graphviz README):
 *
 * - `EdgeAttributeKey`, `NodeAttributeKey`, `GraphAttributeKey`,
 *   `SubgraphAttributeKey`, `ClusterSubgraphAttributeKey` namespaces with
 *   `$values` / `$exclude` interfaces,
 * - `Attribute.$keys` (key names with TSDoc) and `Attribute.$types` (value types).
 *
 * The declarations are written as plain text and formatted by Biome via
 * `pnpm codegen`. (They used to be built with the TypeScript factory API,
 * which TypeScript 7 no longer provides.)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AttributeDoc } from './fetch-graphviz-docs.ts';

const here = dirname(fileURLToPath(import.meta.url));
const docs: AttributeDoc[] = JSON.parse(
  readFileSync(join(here, '..', 'graphviz-docs', 'attrs.json'), 'utf8'),
);
const outFile = join(here, '..', 'src', 'attributes', 'attribute.ts');

/** Graphviz attribute type name -> TypeScript type (from `./types.js` unless primitive). */
const TYPE_MAP: Record<string, string> = {
  addDouble: 'AddDouble',
  addPoint: 'AddPoint',
  arrowType: 'ArrowType',
  bool: 'boolean',
  clusterMode: 'ClusterMode',
  color: 'Color',
  colorList: 'ColorList',
  dirType: 'DirType',
  double: 'Double',
  doubleList: 'DoubleList',
  escString: 'EscString',
  int: 'Int',
  layerList: 'LayerList',
  layerRange: 'LayerRange',
  lblString: 'LblString',
  outputMode: 'OutputMode',
  packMode: 'PackMode',
  pagedir: 'Pagedir',
  point: 'Point',
  pointList: 'PointList',
  portPos: 'PortPos',
  quadType: 'QuadType',
  rankdir: 'Rankdir',
  rankType: 'RankType',
  rect: 'Rect',
  shape: 'Shape',
  smoothType: 'SmoothType',
  splineType: 'SplineType',
  startType: 'StartType',
  string: 'string',
  style: 'Style',
  viewPort: 'ViewPort',
  xdot: 'string',
};

/**
 * Type names that the docs do not use: `blank` (`''`) resets an attribute to
 * its default, and `tbBalanceType` is what `TBbalance` takes.
 */
const EXTRA_TYPES: Record<string, string> = {
  blank: 'Blank',
  tbBalanceType: 'TBbalanceType',
};

/**
 * Value types that are narrower or wider than what the docs encode, as type
 * names (keys of `TYPE_MAP` or `EXTRA_TYPES`).
 */
const TYPE_OVERRIDES: Record<string, string[]> = {
  TBbalance: ['tbBalanceType'],
  gradientangle: ['blank', 'int'],
  height: ['blank', 'double'],
  start: ['blank', 'startType'],
  style: ['blank', 'style'],
  viewport: ['blank', 'viewPort'],
  z: ['blank', 'double'],
};

/** The type names of an attribute's value. */
const typeNamesOf = (attr: AttributeDoc): string[] =>
  TYPE_OVERRIDES[attr.name] ?? attr.types;

/** Type name -> TypeScript type. */
const tsTypeOf = (name: string): string => {
  const type = TYPE_MAP[name] ?? EXTRA_TYPES[name];
  if (type === undefined) throw new Error(`no TypeScript type for "${name}"`);
  return type;
};

const PRIMITIVES = new Set(['string', 'boolean', 'number']);

const OBJECTS = [
  {
    code: 'E',
    name: 'EdgeAttributeKey',
    doc: 'Attribute types available for edges.',
  },
  {
    code: 'N',
    name: 'NodeAttributeKey',
    doc: 'Attribute types available for nodes.',
  },
  {
    code: 'G',
    name: 'GraphAttributeKey',
    doc: 'Attribute types available for root graph.',
  },
  {
    code: 'S',
    name: 'SubgraphAttributeKey',
    doc: 'Attribute types available for subgraph.',
  },
  {
    code: 'C',
    name: 'ClusterSubgraphAttributeKey',
    doc: 'Attribute types available for cluster subgraph.',
  },
] as const;

const byName = (a: string, b: string) =>
  a.localeCompare(b, 'en', { sensitivity: 'base' }) || a.localeCompare(b, 'en');

// --- TSDoc -------------------------------------------------------------------

const SITE_URL = 'https://graphviz.org';
const DOCS_URL = `${SITE_URL}/docs`;

function resolveRelref(target: string): string {
  // relref paths are relative to content/en/docs/attrs/
  const [path, hash] = target.split('#');
  // a leading "/" is relative to the site root (content/en/), otherwise to docs/attrs/
  const segments = path.startsWith('/') ? [] : ['docs', 'attrs'];
  for (const part of path.split('/')) {
    if (part === '..') segments.pop();
    else if (part !== '.' && part !== '') segments.push(part);
  }
  const last = segments.pop() as string;
  const page = last === '_index.md' ? '' : last.replace(/\.md$/, '');
  const url = `${SITE_URL}/${[...segments, page].filter(Boolean).join('/')}/`;
  return hash ? `${url}#${hash}` : url;
}

/** Convert the Markdown body of a doc page to text usable inside a TSDoc comment. */
function bodyToTsdoc(body: string): string {
  const text = body
    // drop example cards entirely
    .replace(/\{\{<\s*dot_card[\s\S]*?\{\{<\s*\/\s*dot_card\s*>\}\}/g, '')
    // links to other attribute pages become {@link}; everything else becomes an absolute URL
    .replace(
      /\[([^\]]+)\]\(\{\{<\s*relref\s+"([^"]+)"\s*>\}\}\)/g,
      (_, label, target) =>
        /^[\w]+\.md$/.test(target)
          ? `{@link ${target.replace(/\.md$/, '')}}`
          : `[${label}](${resolveRelref(target)})`,
    )
    // plain relative / root-relative Markdown links are relative to the attrs page
    .replace(
      /\]\(((?:\.{1,2}\/|\/)[^)]+)\)/g,
      (_, target) => `](${new URL(target, `${DOCS_URL}/attrs/`).href})`,
    )
    // any remaining shortcode
    .replace(/\{\{<[^>]*>\}\}/g, '')
    // comment terminator and TSDoc tag characters
    .replace(/\*\//g, '*\\/')
    .replace(/(^|\s)@(\w)/g, '$1\\@$2')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text;
}

function tsdocFor(attr: AttributeDoc): string {
  const lines: string[] = [];
  const description = attr.description.replace(/\*\//g, '*\\/');
  lines.push(`${description}${/[.!?]$/.test(description) ? '' : '.'}`);
  const body = bodyToTsdoc(attr.body);
  if (body) {
    lines.push('', ...body.split('\n'));
  }
  lines.push(
    '',
    `@see {@link ${DOCS_URL}/attrs/${attr.name}/ Node, Edge and Graph Attributes#${attr.name}}`,
    '',
    '| Key | Value |',
    '| --- | --- |',
    `| type | ${attr.types
      .map((t) => `{@link ${DOCS_URL}/attr-types/${t}/ ${t}}`)
      .join(', ')} |`,
  );
  if (attr.defaults.length) {
    lines.push(
      `| default | ${attr.defaults
        .map((d) => (d.for ? `${d.default} ${d.for}` : d.default))
        .join(', ')
        .replace(/\|/g, '\\|')} |`,
    );
  }
  if (attr.minimums.length) {
    lines.push(`| minimum | ${attr.minimums.join(', ')} |`);
  }
  if (attr.flags.length) {
    lines.push(`| notes | ${attr.flags.join(', ')} only |`);
  }
  lines.push(
    `| used by | ${attr.usedBy.join('')} |`,
    '',
    '@category Attribute',
  );
  return `*\n${lines.map((l) => (l ? ` * ${l}` : ' *')).join('\n')}\n `;
}

/** A declaration preceded by a block comment; `doc` is the comment body, starting with `*`. */
const withDoc = (code: string, doc: string) => `/*${doc}*/\n${code}`;

// --- declarations ------------------------------------------------------------

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const quote = (text: string) => `'${text.replace(/[\\']/g, '\\$&')}'`;
/** Members joined by `|`; no members is `never` (as the TypeScript printer wrote it). */
const union = (members: string[]) =>
  members.length === 0 ? 'never' : members.join(' | ');
/** `keyof $exclude | symbol | number` */
const EXCLUDED_KEYS = 'keyof $exclude | symbol | number';

const namespace = (name: string, body: string[]) =>
  `export namespace ${name} {\n${body.join('\n')}\n}`;

/** `export type values = Exclude<keyof $values, keyof $exclude | symbol | number>;` */
const valuesAlias = () =>
  `export type values = Exclude<keyof $values, ${EXCLUDED_KEYS}>;`;

/** `export interface $values extends $keywords<'a' | 'b'> {}` */
const valuesInterface = (keys: string[]) =>
  `export interface $values extends $keywords<${union(keys.map(quote))}> {}`;

/** `export interface $exclude extends $keywordsValidation {}` */
const excludeInterface = () =>
  'export interface $exclude extends $keywordsValidation {}';

// Fail with a useful message before an unmapped type or a name that is not an
// identifier reaches the output.
for (const attr of docs) {
  if (!IDENTIFIER.test(attr.name))
    throw new Error(`attribute name "${attr.name}" is not an identifier`);
  if (attr.types.length === 0 && !(attr.name in TYPE_OVERRIDES))
    throw new Error(`attribute "${attr.name}" has no types in the docs`);
  for (const t of typeNamesOf(attr)) {
    if (!(t in TYPE_MAP) && !(t in EXTRA_TYPES))
      throw new Error(
        `no TypeScript type for Graphviz type "${t}" (${attr.name})`,
      );
  }
}

const statements: string[] = [];

// import type { ... } from './types.js';
const valueTypeNames = new Set<string>(['$keywords', '$keywordsValidation']);
for (const attr of docs) {
  for (const t of typeNamesOf(attr).map(tsTypeOf)) {
    if (!PRIMITIVES.has(t)) valueTypeNames.add(t);
  }
}
statements.push(
  `import type { ${[...valueTypeNames].sort(byName).join(', ')} } from './types.js';`,
);

// per-object key namespaces
for (const obj of OBJECTS) {
  const keys = docs
    .filter((a) => a.usedBy.includes(obj.code))
    .map((a) => a.name)
    .sort(byName);
  statements.push(
    withDoc(
      `export type ${obj.name} = ${obj.name}.values;`,
      `*\n * ${obj.doc}\n * @group Attribute\n `,
    ),
    withDoc(
      namespace(obj.name, [
        valuesAlias(),
        valuesInterface(keys),
        excludeInterface(),
      ]),
      '* @hidden ',
    ),
  );
}

// export type AttributeKey = ...;
statements.push(
  withDoc(
    `export type AttributeKey = ${union(OBJECTS.map((o) => o.name))};`,
    '*\n * Attribute keys for any DOT object.\n * @group Attribute\n ',
  ),
);

// export type Attribute<T extends AttributeKey> = Attribute.types[T];
statements.push(
  withDoc(
    'export type Attribute<T extends AttributeKey> = Attribute.types[T];',
    '*\n * This type represents an Attribute, which is a key-value mapping of an {@link AttributeKey} to a value.\n *\n * @param T The {@link AttributeKey} to be mapped to a value.\n * @group Attribute\n ',
  ),
);

const sortedDocs = [...docs].sort((a, b) => byName(a.name, b.name));

statements.push(
  namespace('Attribute', [
    `export type keys = Omit<$keys, ${EXCLUDED_KEYS}>;`,
    `export type types = Omit<$types, ${EXCLUDED_KEYS}>;`,
    // No TSDoc on this declaration: `@hidden` on one declaration of a merged
    // interface hides the whole interface from typedoc, including the
    // documented keys below.
    'export interface $keys extends $keywords<AttributeKey> {}',
    excludeInterface(),
    withDoc(
      `export interface $keys {\n${sortedDocs
        .map((attr) =>
          withDoc(`${attr.name}: ${quote(attr.name)};`, tsdocFor(attr)),
        )
        .join('\n')}\n}`,
      '*\n * @group Attribute\n ',
    ),
    withDoc(
      `export interface $types {\n${sortedDocs
        .map(
          (attr) => `${attr.name}: ${union(typeNamesOf(attr).map(tsTypeOf))};`,
        )
        .join('\n')}\n}`,
      '*\n * $types is an interface that defines a set of attributes that can be used to configure a graph.\n ',
    ),
  ]),
);

// export interface AttributeValueTypeNames { ... }
statements.push(
  withDoc(
    `export interface AttributeValueTypeNames {\n${sortedDocs
      .map(
        (attr) =>
          `${attr.name}: ${union([...new Set(typeNamesOf(attr))].map(quote))};`,
      )
      .join('\n')}\n}`,
    [
      '*',
      ' * The value type of each attribute, by type name: the names whose',
      ' * types make up {@link Attribute}, with {@link AttributeValueTypes} as',
      ' * the table from names to types. A schema that changes a value type',
      ' * (see {@link ValueTypes}) changes every attribute that uses it, found',
      ' * here.',
      ' * @group Attribute',
      ' ',
    ].join('\n'),
  ),
);

const header = `// Generated by scripts/generate-attributes.ts from graphviz-docs/attrs.json.
// Do not edit by hand; run \`pnpm codegen\` after updating the snapshot with
// \`pnpm fetch:graphviz-docs\`.
`;
writeFileSync(outFile, `${header}\n${statements.join('\n\n')}\n`);
console.log(`Wrote ${outFile} (${docs.length} attributes)`);
