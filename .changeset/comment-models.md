---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"@ts-graphviz/ast": minor
"@ts-graphviz/react": minor
"ts-graphviz": major
---

Comments are models attached to any object, with their kind and place

Every object takes comments the same way: nodes, edges, subgraphs, root graphs, default attribute statements and `Dot`.

```ts
a.addComment('start');                                          // before the statement, as commentKind says
a.addComment('note', { position: 'trailing', kind: 'Slash' });  // a; // note
g.addComment('end of body', { position: 'end' });               // at the end of the body
a.comments;                                                     // ReadonlyArray<CommentModel>
a.removeComment(comment);
```

- A comment is a frozen `CommentModel` (`$$type: 'Comment'`, `text`, `kind`, `position`); `isCommentModel` checks one. `kind` is `'Block'`, `'Slash'` or `'Macro'`, or `undefined` to write it as `fromModel`'s `commentKind` option says (`Slash` by default).
- `position` is `'leading'` (default) or `'trailing'` on a statement; a graph or subgraph also takes `'end'`, and a DOT source takes `'leading'` and `'end'`. Anything else, a text that is not a string or an unknown kind throws a `TypeError` with code `TSG_ERR_INVALID_COMMENT`.
- `toModel` attaches each comment where it is: one that starts on the line where a statement ends trails it, any other leads the next statement, and those after the last statement are the body's `'end'` comments (3.x kept one comment per statement, of no kind, and dropped the rest). `fromModel` writes them back there, so `fromDot` → `toDot` keeps comments, their kind and their place. A comment around a graph attribute assignment (`color=blue`) leads the next statement, a node mentioned again takes the comments of each mention (at its first place), and a comment inside a statement's tokens (`a [ /* c */ label=x ]`) is not kept, as in 3.x.
- Compared with 3.x, `comment` (on every model, and `$comment` in the DSL) is deprecated and removed in v5. It is now an accessor for the first leading comment: reading gives its text, setting replaces it (keeping its kind) or adds one, and `undefined` removes it; `delete x.comment` no longer clears it. A `Dot`'s `comment` reads all its comments joined by line breaks, and setting it replaces them by one leading comment. The read-only model types have `comments` too (optional: a model written for 3.x has its `comment` read as one leading comment). `@ts-graphviz/react`'s `comment` prop becomes the model's leading comment.
