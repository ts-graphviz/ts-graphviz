import type { Code, Root } from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import type { Transformer } from 'unified';
import { describe, expect, it } from 'vitest';
import plugin from './remark-plugin-tsgraphviz';

const IMPORT =
  "import TSGraphvizLiveEditor from '@site/src/components/TSGraphvizLiveEditor'";

const code = (value: string, meta: string | null, lang = 'ts'): Code => ({
  type: 'code',
  lang,
  meta,
  value,
});

async function transform(root: Root): Promise<Root> {
  // The plugin ignores its processor (`this`).
  const transformer = (plugin as unknown as () => Transformer<Root>)();
  await transformer(root, undefined as never, () => {});
  return root;
}

const editors = (root: Root) =>
  root.children.filter(
    (node): node is MdxJsxFlowElement => node.type === 'mdxJsxFlowElement',
  );

const attributes = (element: MdxJsxFlowElement) =>
  Object.fromEntries(
    element.attributes.map((a) => [
      'name' in a ? a.name : '',
      'value' in a ? a.value : undefined,
    ]),
  );

describe('remark-plugin-tsgraphviz', () => {
  it('turns ts-graphviz code blocks into live editors', async () => {
    const root = await transform({
      type: 'root',
      children: [code("digraph('G');", 'ts-graphviz')],
    });
    const [editor] = editors(root);
    expect(editor.name).toBe('TSGraphvizLiveEditor');
    expect(attributes(editor)).toEqual({ script: "digraph('G');" });
  });

  it('marks read-only blocks with a boolean attribute', async () => {
    const root = await transform({
      type: 'root',
      children: [code('x', 'ts-graphviz:read-only')],
    });
    expect(attributes(editors(root)[0])).toEqual({
      script: 'x',
      readOnly: null,
    });
  });

  it('leaves other code blocks alone', async () => {
    const blocks = [
      code('a', null),
      code('b', 'title="x.ts"'),
      code('c', 'graphviz', 'dot'),
    ];
    const root = await transform({ type: 'root', children: [...blocks] });
    expect(root.children).toEqual(blocks);
  });

  it('adds the import once, only when needed', async () => {
    const root = await transform({
      type: 'root',
      children: [code('a', 'ts-graphviz'), code('b', 'ts-graphviz:read-only')],
    });
    const imports = root.children.filter((node) => node.type === 'mdxjsEsm');
    expect(imports).toHaveLength(1);
    expect(root.children[0]).toMatchObject({ type: 'mdxjsEsm', value: IMPORT });
    expect(editors(root)).toHaveLength(2);

    const plain = await transform({
      type: 'root',
      children: [code('a', null)],
    });
    expect(plain.children.some((node) => node.type === 'mdxjsEsm')).toBe(false);
  });

  it('does not import twice', async () => {
    const root = await transform({
      type: 'root',
      children: [
        { type: 'mdxjsEsm', value: IMPORT } as any,
        code('a', 'ts-graphviz'),
      ],
    });
    expect(
      root.children.filter((node) => node.type === 'mdxjsEsm'),
    ).toHaveLength(1);
  });

  it('finds code blocks nested in other nodes', async () => {
    const root = await transform({
      type: 'root',
      children: [
        {
          type: 'blockquote',
          children: [code('nested', 'ts-graphviz')],
        },
      ],
    });
    const quote = root.children.find((node) => node.type === 'blockquote');
    expect(quote).toMatchObject({
      children: [{ type: 'mdxJsxFlowElement', name: 'TSGraphvizLiveEditor' }],
    });
  });
});
