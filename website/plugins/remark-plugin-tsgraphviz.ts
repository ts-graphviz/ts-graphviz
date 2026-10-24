import type { Code, Literal } from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import type { Plugin, Transformer } from 'unified';
import type { Node, Parent } from 'unist';

// biome-ignore lint/complexity/noBannedTypes: Preliminary implementation for future plugin extensibility.
type PluginOptions = {};

type CodeBlockOptions = {
  readOnly: boolean;
};

const transformNode = (code: Code): MdxJsxFlowElement[] => {
  const script = code.value;
  const options = getTSGraphvizOptions(code);
  return [
    {
      type: 'mdxJsxFlowElement',
      name: 'TSGraphvizLiveEditor',
      attributes: [
        {
          type: 'mdxJsxAttribute',
          name: 'script',
          value: script,
        },
        {
          type: 'mdxJsxAttribute',
          name: 'readOnly',
          value: options.readOnly ? 'true' : 'false',
        },
      ],
      children: [],
    },
  ];
};

const isMdxEsmLiteral = (node: Node): node is Literal =>
  node.type === 'mdxjsEsm';

const isTSGraphvizLiveEditorImport = (node: Node): boolean =>
  isMdxEsmLiteral(node) &&
  node.value.includes('@site/src/components/TSGraphvizLiveEditor');

const isParent = (node: Node): node is Parent =>
  Array.isArray((node as Parent).children);
const isTSGraphvizScript = (node: Node): node is Code =>
  node.type === 'code' && (node as Code).meta?.startsWith('ts-graphviz');

const getTSGraphvizOptions = (code: Code): CodeBlockOptions => {
  const options = code.meta ? code.meta.split(':').slice(1) : [];
  return {
    readOnly: options.includes('read-only'),
  };
};

function createImportNode() {
  return {
    type: 'mdxjsEsm',
    value:
      "import TSGraphvizLiveEditor from '@site/src/components/TSGraphvizLiveEditor'",
    data: {
      estree: {
        type: 'Program',
        body: [
          {
            type: 'ImportDeclaration',
            specifiers: [
              {
                type: 'ImportDefaultSpecifier',
                local: { type: 'Identifier', name: 'TSGraphvizLiveEditor' },
              },
            ],
            source: {
              type: 'Literal',
              value: '@site/src/components/TSGraphvizLiveEditor',
              raw: "'@site/src/components/TSGraphvizLiveEditor'",
            },
          },
        ],
        sourceType: 'module',
      },
    },
  };
}

const plugin: Plugin<[PluginOptions?]> = (options = {}): Transformer => {
  return async (root) => {
    const { visit } = await import('unist-util-visit');

    let transformed = false;
    let alreadyImported = false;

    visit(root, (node: Node) => {
      if (isTSGraphvizLiveEditorImport(node)) {
        alreadyImported = true;
      }

      if (isParent(node)) {
        const newChildren: Node[] = [];
        for (const child of node.children) {
          if (isTSGraphvizScript(child)) {
            newChildren.push(...transformNode(child));
            transformed = true;
          } else {
            newChildren.push(child);
          }
        }
        node.children = newChildren;
      }
    });

    if (transformed && !alreadyImported) {
      (root as Parent).children.unshift(createImportNode());
    }
  };
};

export default plugin;
