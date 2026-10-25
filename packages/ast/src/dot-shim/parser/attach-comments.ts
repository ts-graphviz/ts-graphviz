import type {
  ASTNode,
  CommentASTNode,
  CommentKind,
  FileRange,
} from '../../types.js';

/** A comment the parser read inside a statement (see the `ic` rule). */
export interface InlineComment {
  kind: CommentKind;
  value: string;
  location: FileRange;
}

const COMMENT_FIELDS = new Set([
  'leadingComments',
  'trailingComments',
  'danglingComments',
]);

function isNode(value: unknown): value is ASTNode & { location: FileRange } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'location' in value
  );
}

/** The AST nodes directly inside a node (properties and lists), in source order. */
function childrenOf(node: ASTNode): (ASTNode & { location: FileRange })[] {
  const found: (ASTNode & { location: FileRange })[] = [];
  for (const [key, value] of Object.entries(node)) {
    if (COMMENT_FIELDS.has(key)) continue;
    for (const child of Array.isArray(value) ? value : [value]) {
      if (isNode(child)) found.push(child);
    }
  }
  return found.sort(
    (a, b) => a.location.start.offset - b.location.start.offset,
  );
}

/**
 * The nodes a comment enclosed by `node` (and by none of its children) may
 * attach to, before and after it. Graphs, subgraphs and attribute lists
 * hold their body in `children`; such a comment is in the header
 * (`digraph /* c *\/ G {`, `node /* c *\/ [ ... ]`): it trails the id when
 * it follows one, and is dangling on the node otherwise, so it is printed
 * back after the keyword.
 */
function candidates(
  node: ASTNode,
  all: (ASTNode & { location: FileRange })[],
): {
  before: (ASTNode & { location: FileRange })[];
  after: (ASTNode & { location: FileRange })[];
} {
  // Never a Comment statement: a comment printed after `# x` on its line
  // would become part of it.
  const children = all.filter((c) => c.type !== 'Comment');
  switch (node.type) {
    case 'Graph':
    case 'Subgraph':
      return { before: children.filter((c) => c === node.id), after: [] };
    case 'AttributeList':
      return { before: [], after: [] };
    default:
      return { before: children, after: children };
  }
}

function add(
  node: ASTNode,
  field: 'leadingComments' | 'trailingComments' | 'danglingComments',
  comment: CommentASTNode,
): void {
  const holder = node as Record<typeof field, CommentASTNode[] | undefined>;
  holder[field] ??= [];
  holder[field].push(comment);
}

function collectStatementComments(node: ASTNode, ranges: FileRange[]): void {
  if (node.type === 'Comment' && node.location) {
    ranges.push(node.location);
  }
  for (const child of childrenOf(node)) {
    collectStatementComments(child, ranges);
  }
}

/**
 * Attach comments read inside statements to the nodes next to them, as
 * Prettier, Biome and Ruff do: after a node on the same line → its
 * `trailingComments`; otherwise before the next node → its
 * `leadingComments`; with no node before or after inside the innermost
 * enclosing node → that node's `danglingComments`. A comment the parser
 * also read as a `Comment` statement (while backtracking) is left there.
 */
export function attachComments(
  root: ASTNode,
  comments: Iterable<InlineComment>,
): void {
  // Consecutive `//` lines are one Comment statement, so a line the parser
  // recorded on its own may lie inside one: skip what any covers.
  const statementComments: FileRange[] = [];
  collectStatementComments(root, statementComments);
  const sorted = [...comments]
    .filter(
      (c) =>
        !statementComments.some(
          (r) =>
            r.start.offset <= c.location.start.offset &&
            c.location.end.offset <= r.end.offset,
        ),
    )
    .sort((a, b) => a.location.start.offset - b.location.start.offset);

  for (const recorded of sorted) {
    const comment: CommentASTNode = {
      type: 'Comment',
      kind: recorded.kind,
      value: recorded.value,
      location: recorded.location,
    };
    const start = recorded.location.start.offset;
    const end = recorded.location.end.offset;

    // Descend to the innermost node that contains the comment.
    let enclosing: ASTNode = root;
    for (;;) {
      const inner = childrenOf(enclosing).find(
        (c) => c.location.start.offset <= start && end <= c.location.end.offset,
      );
      if (!inner) break;
      enclosing = inner;
    }
    const { before, after } = candidates(enclosing, childrenOf(enclosing));
    const preceding = before
      .filter((c) => c.location.end.offset <= start)
      .at(-1);
    const following = after.find((c) => end <= c.location.start.offset);

    if (
      preceding &&
      preceding.location.end.line === recorded.location.start.line
    ) {
      add(preceding, 'trailingComments', comment);
    } else if (following) {
      add(following, 'leadingComments', comment);
    } else if (preceding) {
      add(preceding, 'trailingComments', comment);
    } else {
      add(enclosing, 'danglingComments', comment);
    }
  }
}
