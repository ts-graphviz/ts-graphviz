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
 * The declarations are built with the TypeScript factory API and printed with
 * the TypeScript printer, then formatted by Biome via `pnpm codegen`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
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
 * Value types that are narrower or wider than what the docs encode.
 * `Blank` (`''`) resets an attribute to its default.
 */
const TYPE_OVERRIDES: Record<string, string[]> = {
  TBbalance: ['TBbalanceType'],
  gradientangle: ['Blank', 'Int'],
  height: ['Blank', 'Double'],
  start: ['Blank', 'StartType'],
  style: ['Blank', 'Style'],
  viewport: ['Blank', 'ViewPort'],
  z: ['Blank', 'Double'],
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

function withDoc<T extends ts.Node>(node: T, doc: string): T {
  return ts.addSyntheticLeadingComment(
    node,
    ts.SyntaxKind.MultiLineCommentTrivia,
    doc,
    true,
  );
}

// --- factories -------------------------------------------------------------------

const { factory: f } = ts;
const exportMod = () => f.createModifier(ts.SyntaxKind.ExportKeyword);
const ref = (name: string, args?: ts.TypeNode[]) =>
  f.createTypeReferenceNode(f.createIdentifier(name), args);
const union = (members: ts.TypeNode[]) =>
  members.length === 1 ? members[0] : f.createUnionTypeNode(members);
const literalUnion = (names: string[]) =>
  union(names.map((n) => f.createLiteralTypeNode(f.createStringLiteral(n))));
/** `keyof $exclude | symbol | number` */
const excludedKeys = () =>
  f.createUnionTypeNode([
    f.createTypeOperatorNode(ts.SyntaxKind.KeyOfKeyword, ref('$exclude')),
    f.createKeywordTypeNode(ts.SyntaxKind.SymbolKeyword),
    f.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
  ]);

/** `export type values = Exclude<keyof $values, keyof $exclude | symbol | number>;` */
const valuesAlias = () =>
  f.createTypeAliasDeclaration(
    [exportMod()],
    'values',
    undefined,
    ref('Exclude', [
      f.createTypeOperatorNode(ts.SyntaxKind.KeyOfKeyword, ref('$values')),
      excludedKeys(),
    ]),
  );

/** `export interface $values extends $keywords<'a' | 'b'> {}` */
const valuesInterface = (keys: string[]) =>
  f.createInterfaceDeclaration(
    [exportMod()],
    '$values',
    undefined,
    [
      f.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        f.createExpressionWithTypeArguments(f.createIdentifier('$keywords'), [
          literalUnion(keys),
        ]),
      ]),
    ],
    [],
  );

/** `export interface $exclude extends $keywordsValidation {}` */
const excludeInterface = () =>
  f.createInterfaceDeclaration(
    [exportMod()],
    '$exclude',
    undefined,
    [
      f.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
        f.createExpressionWithTypeArguments(
          f.createIdentifier('$keywordsValidation'),
          undefined,
        ),
      ]),
    ],
    [],
  );

const namespace = (name: string, body: ts.Statement[]) =>
  f.createModuleDeclaration(
    [exportMod()],
    f.createIdentifier(name),
    f.createModuleBlock(body),
    ts.NodeFlags.Namespace,
  );

// Fail with a useful message before an unmapped type reaches the TypeScript factory.
for (const attr of docs) {
  for (const t of attr.types) {
    if (!(t in TYPE_MAP))
      throw new Error(
        `no TypeScript type for Graphviz type "${t}" (${attr.name})`,
      );
  }
}

const statements: ts.Statement[] = [];

// import type { ... } from './types.js';
const valueTypeNames = new Set<string>(['$keywords', '$keywordsValidation']);
for (const attr of docs) {
  for (const t of TYPE_OVERRIDES[attr.name] ??
    attr.types.map((t) => TYPE_MAP[t])) {
    if (!PRIMITIVES.has(t)) valueTypeNames.add(t);
  }
}
statements.push(
  f.createImportDeclaration(
    undefined,
    f.createImportClause(
      ts.SyntaxKind.TypeKeyword,
      undefined,
      f.createNamedImports(
        [...valueTypeNames]
          .sort(byName)
          .map((n) =>
            f.createImportSpecifier(false, undefined, f.createIdentifier(n)),
          ),
      ),
    ),
    f.createStringLiteral('./types.js'),
  ),
);

// per-object key namespaces
for (const obj of OBJECTS) {
  const keys = docs
    .filter((a) => a.usedBy.includes(obj.code))
    .map((a) => a.name)
    .sort(byName);
  statements.push(
    withDoc(
      f.createTypeAliasDeclaration(
        [exportMod()],
        obj.name,
        undefined,
        f.createTypeReferenceNode(
          f.createQualifiedName(f.createIdentifier(obj.name), 'values'),
        ),
      ),
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
    f.createTypeAliasDeclaration(
      [exportMod()],
      'AttributeKey',
      undefined,
      f.createUnionTypeNode(OBJECTS.map((o) => ref(o.name))),
    ),
    '*\n * Attribute keys for any DOT object.\n * @group Attribute\n ',
  ),
);

// export type Attribute<T extends AttributeKey> = Attribute.types[T];
statements.push(
  withDoc(
    f.createTypeAliasDeclaration(
      [exportMod()],
      'Attribute',
      [f.createTypeParameterDeclaration(undefined, 'T', ref('AttributeKey'))],
      f.createIndexedAccessTypeNode(
        f.createTypeReferenceNode(
          f.createQualifiedName(f.createIdentifier('Attribute'), 'types'),
        ),
        ref('T'),
      ),
    ),
    '*\n * This type represents an Attribute, which is a key-value mapping of an {@link AttributeKey} to a value.\n *\n * @param T The {@link AttributeKey} to be mapped to a value.\n * @group Attribute\n ',
  ),
);

const sortedDocs = [...docs].sort((a, b) => byName(a.name, b.name));
const omit = (from: string) => ref('Omit', [ref(from), excludedKeys()]);

statements.push(
  namespace('Attribute', [
    f.createTypeAliasDeclaration(
      [exportMod()],
      'keys',
      undefined,
      omit('$keys'),
    ),
    f.createTypeAliasDeclaration(
      [exportMod()],
      'types',
      undefined,
      omit('$types'),
    ),
    // No TSDoc on this declaration: `@hidden` on one declaration of a merged
    // interface hides the whole interface from typedoc, including the
    // documented keys below.
    f.createInterfaceDeclaration(
      [exportMod()],
      '$keys',
      undefined,
      [
        f.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [
          f.createExpressionWithTypeArguments(f.createIdentifier('$keywords'), [
            ref('AttributeKey'),
          ]),
        ]),
      ],
      [],
    ),
    excludeInterface(),
    withDoc(
      f.createInterfaceDeclaration(
        [exportMod()],
        '$keys',
        undefined,
        undefined,
        sortedDocs.map((attr) =>
          withDoc(
            f.createPropertySignature(
              undefined,
              f.createIdentifier(attr.name),
              undefined,
              f.createLiteralTypeNode(f.createStringLiteral(attr.name)),
            ),
            tsdocFor(attr),
          ),
        ),
      ),
      '*\n * @group Attribute\n ',
    ),
    withDoc(
      f.createInterfaceDeclaration(
        [exportMod()],
        '$types',
        undefined,
        undefined,
        sortedDocs.map((attr) =>
          f.createPropertySignature(
            undefined,
            f.createIdentifier(attr.name),
            undefined,
            union(
              (
                TYPE_OVERRIDES[attr.name] ?? attr.types.map((t) => TYPE_MAP[t])
              ).map((t) =>
                PRIMITIVES.has(t)
                  ? f.createKeywordTypeNode(
                      t === 'string'
                        ? ts.SyntaxKind.StringKeyword
                        : t === 'boolean'
                          ? ts.SyntaxKind.BooleanKeyword
                          : ts.SyntaxKind.NumberKeyword,
                    )
                  : ref(t),
              ),
            ),
          ),
        ),
      ),
      '*\n * $types is an interface that defines a set of attributes that can be used to configure a graph.\n ',
    ),
  ]),
);

const source = ts.createSourceFile(
  'attribute.ts',
  '',
  ts.ScriptTarget.Latest,
  false,
  ts.ScriptKind.TS,
);
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
const header = `// Generated by scripts/generate-attributes.ts from graphviz-docs/attrs.json.
// Do not edit by hand; run \`pnpm codegen\` after updating the snapshot with
// \`pnpm fetch:graphviz-docs\`.
`;
const code = statements
  .map((s) => printer.printNode(ts.EmitHint.Unspecified, s, source))
  .join('\n\n');
writeFileSync(outFile, `${header}\n${code}\n`);
console.log(`Wrote ${outFile} (${docs.length} attributes)`);
