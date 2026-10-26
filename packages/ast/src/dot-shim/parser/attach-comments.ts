import { hasField } from '../../own-field.js';
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
    // Own fields: an inherited `type` or `location` does not make a node.
    hasField(value, 'type') &&
    hasField(value, 'location')
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
  // Written into, so an array of the node's own: never one it shares
  // through a prototype (a class's or Object.prototype's).
  if (!Object.hasOwn(holder, field) || holder[field] == null) {
    // Defined, not assigned: a getter without a setter on a class would
    // refuse an assignment.
    Object.defineProperty(holder, field, {
      value: [],
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }
  (holder[field] as CommentASTNode[]).push(comment);
}

function collectStatementComments(node: ASTNode, ranges: FileRange[]): void {
  if (node.type === 'Comment' && node.location) {
    ranges.push(node.location);
  }
  for (const child of childrenOf(node)) {
    collectStatementComments(child, ranges);
  }
}

/** Whether `inner` lies within `outer`. */
function within(inner: FileRange, outer: FileRange): boolean {
  return (
    outer.start.offset <= inner.start.offset &&
    inner.end.offset <= outer.end.offset
  );
}

/**
 * Attach the comments from `comments[from]` on that lie inside `bounds`
 * (all of them for the root) to `node` and its
 * descendants, and return the index of the first comment after them.
 *
 * The comments are sorted and do not overlap, and neither do a node's
 * children. Each node's children are listed once, and the children, the
 * candidates before and after a comment and the comments are each walked
 * forward only. A comment is looked at once by the node it attaches to
 * and once by each node that hands it on or returns at it, so the time is
 * linear in the size of the tree plus the number of comments (apart from
 * sorting each node's children), at any nesting depth.
 */
function attachWithin(
  node: ASTNode,
  comments: InlineComment[],
  from: number,
  onAttach: () => void,
  bounds?: FileRange,
): number {
  const children = childrenOf(node);
  const { before, after } = candidates(node, children);
  let child = 0;
  let preceding = -1; // index in `before` of the last one ending before the comment
  let following = 0; // index in `after` of the first one starting after it
  let i = from;
  while (i < comments.length) {
    const recorded = comments[i];
    if (bounds && !within(recorded.location, bounds)) break;
    const start = recorded.location.start.offset;
    const end = recorded.location.end.offset;
    while (
      child < children.length &&
      children[child].location.end.offset <= start
    ) {
      child++;
    }
    const inner = children[child];
    if (inner !== undefined && within(recorded.location, inner.location)) {
      i = attachWithin(inner, comments, i, onAttach, inner.location);
      continue;
    }
    while (
      preceding + 1 < before.length &&
      before[preceding + 1].location.end.offset <= start
    ) {
      preceding++;
    }
    while (
      following < after.length &&
      after[following].location.start.offset < end
    ) {
      following++;
    }
    onAttach();
    const comment: CommentASTNode = {
      type: 'Comment',
      kind: recorded.kind,
      value: recorded.value,
      location: recorded.location,
    };
    const previous = before[preceding];
    const next = after[following];
    if (
      previous &&
      previous.location.end.line === recorded.location.start.line
    ) {
      add(previous, 'trailingComments', comment);
    } else if (next) {
      add(next, 'leadingComments', comment);
    } else if (previous) {
      add(previous, 'trailingComments', comment);
    } else {
      add(node, 'danglingComments', comment);
    }
    i++;
  }
  return i;
}

/**
 * Attach comments read inside statements to the nodes next to them, as
 * Prettier, Biome and Ruff do: after a node on the same line → its
 * `trailingComments`; otherwise before the next node → its
 * `leadingComments`; with no node before or after inside the innermost
 * enclosing node → that node's `danglingComments`. A comment the parser
 * also read as a `Comment` statement (while backtracking) is left there.
 * `onAttach` is called before each comment is attached (to count it as an
 * AST node).
 */
export function attachComments(
  root: ASTNode,
  comments: Iterable<InlineComment>,
  onAttach: () => void = () => {},
): void {
  // Consecutive `//` lines are one Comment statement, so a line the parser
  // recorded on its own may lie inside one: skip what any covers. Neither
  // the statements nor the recorded comments overlap, so both lists are in
  // order of their ends too and one pass compares them.
  const statementComments: FileRange[] = [];
  collectStatementComments(root, statementComments);
  statementComments.sort((a, b) => a.start.offset - b.start.offset);
  const sorted = [...comments].sort(
    (a, b) => a.location.start.offset - b.location.start.offset,
  );
  const kept: InlineComment[] = [];
  let r = 0;
  for (const c of sorted) {
    while (
      r < statementComments.length &&
      statementComments[r].end.offset < c.location.end.offset
    ) {
      r++;
    }
    const statement = statementComments[r];
    if (statement === undefined || !within(c.location, statement)) {
      kept.push(c);
    }
  }
  attachWithin(root, kept, 0, onAttach);
}
