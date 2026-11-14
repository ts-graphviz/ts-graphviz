---
description: DOT DSL を使い、DOT と同じように文を一つずつ書いてグラフを作ります。
---
# DOT DSL でグラフを書く

ファクトリー `digraph()`、`graph()`、`strict.digraph()`、`strict.graph()` は、グラフの **DOT DSL** を返します。DSL は DOT と同じように読めます。DOT の文がメソッドに、属性がプロパティになっています。DOT でグラフを書ける人は、そのまま DSL でも書けます。

```typescript
import { digraph, toDot } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.rankdir = 'LR';
  g.node({ shape: 'box' });
  const a = g.node('a', { label: 'Start' });
  g.edge([a, 'b', 'c']);
});

console.log(toDot(G));
// digraph "G" {
//   rankdir = "LR";
//   node [
//     shape = "box";
//   ];
//   "a" [
//     label = "Start";
//   ];
//   "a" -> "b" -> "c";
// }
```

DSL はグラフのモデル、つまり [DOT Object Model（DOM）](./02-model-api.md)の代わりで、DOT の語彙だけを持ちます：属性、文、ポート、コメントです。モデルのそれ以外の機能はモデルにあり、`modelOf(x)` で得られます（[DSL にあるもの、モデルにあるもの](#what-is-on-the-dsl-and-what-on-the-model)を参照）。

## DOT から DSL へ

| DOT | DSL |
| --- | --- |
| `digraph G { ... }` | `digraph('G', (g) => { ... })` |
| `strict graph { ... }` | `strict.graph((g) => { ... })` |
| `rankdir = LR;` | `g.rankdir = 'LR';` |
| `a [label = "A"];` | `g.node('a', { label: 'A' });` |
| `a -> b -> c;` | `g.edge(['a', 'b', 'c']);` |
| `c -> {d e};` | `g.edge(['c', ['d', 'e']]);` |
| `a:p1:n -> a:p2:s;` | `g.edge(['a:p1:n', a.port({ port: 'p2', compass: 's' })]);` |
| `node [shape = box];` | `g.node({ shape: 'box' });` |
| `edge [color = gray];` | `g.edge({ color: 'gray' });` |
| `graph [fontname = Helvetica];` | `g.graph({ fontname: 'Helvetica' });` |
| `subgraph cluster_0 { label = Group; d; e; }` | `g.subgraph('cluster_0', { label: 'Group' }, (s) => { s.node('d'); s.node('e'); });` |
| `{ rank = same; b; c; }` | `g.subgraph({ rank: 'same' }, (s) => { s.node('b'); s.node('c'); });` |
| `// note` | `a.addComment('note');` |

まとめると次のようになります。

```typescript
import { digraph, toDot } from 'ts-graphviz';

const G = digraph('G', (g) => {
  g.node({ shape: 'box' });
  const a = g.node('a', { label: 'Start' });
  g.node('b');
  g.edge([a, 'b', 'c']);
  g.edge(['c', ['d', 'e']]);
  g.edge(['a:p1:n', a.port({ port: 'p2', compass: 's' })]);
  g.subgraph('cluster_0', { label: 'Group' }, (s) => {
    s.node('d');
    s.node('e');
  });
  g.subgraph({ rank: 'same' }, (s) => {
    s.node('b');
    s.node('c');
  });
});

console.log(toDot(G));
// digraph "G" {
//   node [
//     shape = "box";
//   ];
//   "a" [
//     label = "Start";
//   ];
//   "b";
//   "a" -> "b" -> "c";
//   "c" -> {"d" "e"};
//   "a":"p1":"n" -> "a":"p2":"s";
//   subgraph "cluster_0" {
//     label = "Group";
//     "d";
//     "e";
//   }
//   subgraph {
//     rank = "same";
//     "b";
//     "c";
//   }
// }
```

`g.node(id)` と `g.subgraph(id)` は、呼ぶたびに、呼んだ位置にその id の宣言を追加します。DOT で同じ文を二度書いたときと同じで、前の宣言は残り、両方が同じ属性を設定していれば後のほうが効きます。コールバックはノード・エッジ・サブグラフの DSL を受け取り、メソッドも同じ DSL を返します。

属性名には型が付いているので、エディタで補完され、値も検査されます。id が `cluster` で始まるサブグラフは、クラスターの属性（`label`、`color` など）を受け取ります。

## 属性

属性はその名前のプロパティです。`undefined` を代入するか `delete` すると削除されます。

```typescript
import { digraph } from 'ts-graphviz';

digraph((g) => {
  const a = g.node('a');
  a.label = 'A';
  a.color = 'red';
  delete a.label; // 属性を削除する
  a.color = undefined; // undefined の代入でも削除される
  console.log(a.label); // undefined
});
```

属性メソッド（`getAttribute`、`setAttributes`、`getAttributeNames` など）はモデルにあります。変数に入った属性名など、どの属性名でも受け取ります。

```typescript
import { digraph, modelOf } from 'ts-graphviz';

digraph((g) => {
  const a = modelOf(g.node('a'));
  a.setAttributes({ label: 'A', color: 'red' });
  console.log(a.getAttribute('label')); // 'A'
  console.log(a.getAttributeNames()); // ['label', 'color']
  a.removeAttributes(); // すべて
});
```

## DSL にあるもの、モデルにあるもの {#what-is-on-the-dsl-and-what-on-the-model}

DSL は DOT の語彙だけを持つので、その名前はどれも Graphviz の属性ではなく、エディターの補完には属性と少数の DSL のメンバーが並びます（自分のスキーマに `port` のような同じ名前の属性があるときは、モデルの `getAttribute` / `setAttribute` で読み書きします）。

| DSL にあるもの | 意味 |
| --- | --- |
| `a.label`、`a.id`、`a.comment`、`g.size` など | Graphviz の属性 |
| `g.node(...)`、`g.edge(...)`、`g.subgraph(...)`、`g.graph(...)` | DOT の文（グラフとサブグラフ） |
| `a.port('p')` | エッジの端点にする、ポート付きのノード |
| `a.addComment('note')` | DOT ソースに書き込むコメント |
| `a.$$type`、`list.$$kind` | モデルの種類（`'Node'`、`'Edge'` など）と既定属性リストの種類 |

それ以外はすべて、`modelOf(x)` で得られるモデルにあります。ノードやグラフの名前（`id`）、グラフの中身（`nodes`、`edges`、`subgraphs`、`statements`）、そのメソッド（`getNodes`、`addNode`、`removeNode` など）、属性メソッド、`comments`、エッジの `targets`、自作のモデルクラスのメンバーです。

```typescript
import { digraph, modelOf } from 'ts-graphviz';

digraph('G', (g) => {
  const a = g.node('a');
  a.id = 'svg-a'; // Graphviz の id 属性
  console.log(modelOf(a).id); // 'a'：ノードの名前
  console.log(a.id); // 'svg-a'
  console.log(modelOf(g).id); // 'G'
  console.log(modelOf(g).nodes.length); // 1
  console.log(a.$$type); // 'Node'
});
```

自作クラスのメンバーもモデルにあります。

```typescript
import { Edge, modelOf, withModelKit } from 'ts-graphviz';

class MyEdge extends Edge {
  cost() {
    return 1;
  }
}

const { digraph } = withModelKit({ Edge: MyEdge });
digraph((g) => {
  const e = g.edge(['a', 'b']);
  console.log(modelOf(e).cost()); // 1
});
```

文はグラフのモデルキットでモデルを作り、作ったものをグラフに追加します。コールバックは第 2 引数でそのキットを受け取るので、追加せずにモデルを作ることもできます。

```typescript
import { digraph, modelOf } from 'ts-graphviz';

digraph((g, kit) => {
  const a = kit.createNode('a'); // まだどのグラフにも入っていない
  modelOf(g).addNode(a);
});
```

## コメント

`addComment` は、ノード、エッジ、サブグラフ、グラフ、既定属性の文にコメントを付けます。既定では文の前に書かれます。`position: 'trailing'` で文の後に、グラフやサブグラフでは `position: 'end'` で本体の最後に書かれます。`kind` は `'Slash'`（`//`）、`'Block'`（`/* */`）、`'Macro'`（`#`）のいずれかです。

```typescript
import { digraph, toDot } from 'ts-graphviz';

const G = digraph((g) => {
  const a = g.node('a');
  a.addComment('start');
  a.addComment('note', { position: 'trailing', kind: 'Block' });
  a.comment = 'kept by Graphviz'; // Graphviz の comment 属性
});

console.log(toDot(G));
// digraph {
//   // start
//   "a" [
//     comment = "kept by Graphviz";
//   ]; /* note */
// }
```

モデルでは、`comments` で一覧を得て、`removeComment(comment)` で取り除けます（`modelOf(a).comments`）。DSL での `comment` は Graphviz の属性で、Graphviz が出力に書き込みます。DOT ソースのコメントは `CommentModel` です。

## 読み込んだグラフを編集する

`fromDot` はモデルを返し、`{ dsl: true }` を渡すとそのモデルの DSL を返すので、読み込んだグラフも同じ書き方で編集できます。`fromDotAll` も同じオプションを受け取ります。

```typescript
import { dsl, fromDot, modelOf, toDot } from 'ts-graphviz';

const g = fromDot('digraph { a [label = "A"]; a -> b; }', { dsl: true });
dsl(modelOf(g).getNodes('a')[0]).color = 'red';
g.edge(['b', 'c']);

console.log(toDot(g));
```

`g.node('a')` は、DOT で文をもう一度書いたときと同じく `a` をもう一度宣言します（ほかの文の後ろに `a [color = "red"];`）。既にあるノードを変えるときは、`getNodes` でモデルから取り出してください。`getNodes` はその id の宣言をすべて順に返します。二つの宣言が同じ属性を設定していれば後のほうが効くので、その宣言を変えるか、それらの後でノードを宣言してください。

文が返すものは DSL です。DSL は、モデルと、文がモデルを作るときに使うキットの組です。一つのモデルと一つのキットに DSL は一つなので、DSL は `===` で比較できます。`modelOf(x)` でモデルに戻せます。そこから読んだモデルの DSL は `dsl(model)` で得られ、この DSL は既定のキットで作ります。`dsl(model, kit)` は `kit` で作る DSL を返します。`{ dsl: true }` では `convert.models` のキットが使われます。`toDot`、`fromModel`、アダプターの `toBlob` は、モデルだけでなく DSL も受け取ります。

## DOT の文の順序

DOT と同じく、既定属性の文はその後に書いたものにだけ適用されます。`g.node({ ... })`、`g.edge({ ... })`、`g.graph({ ... })` は、呼んだ位置に既定属性の文を追加して、その DSL を返します。返された DSL を取っておけば、後からその既定値を変更できます。

```typescript
import { digraph, toDot } from 'ts-graphviz';

const G = digraph((g) => {
  g.node('a');
  const defaults = g.node({ shape: 'box' }); // 後に書いたものに適用される
  g.node('b');
  defaults.color = 'red';
});

console.log(toDot(G));
// digraph {
//   "a";
//   node [
//     shape = "box";
//     color = "red";
//   ];
//   "b";
// }
```

`fromDot` はソースの既定属性の文をその位置に残すので、`node [color=red]; a; node [color=blue]; b` は Graphviz と同じく `a` が赤、`b` が青になります。ノード自身に設定した属性（`g.node('a', { color: 'green' })`）は、常に既定値より優先されます。

3.x は既定属性の文をすべてグラフごとに一組の既定値にまとめ、先頭に書き出していたため、他の文の後に書いた既定値もそれより前のものに適用されていました。v4 への移行中に 3.x と同じ出力を保つには、`ts-graphviz/legacy` から import します。`ts-graphviz` と同じ名前を持ち、ファクトリーと `fromDot` が 3.x のクラス（`legacyModels`）を使います。このエントリーは非推奨で、v5 で削除されます。そのままの名前でエクスポートされるクラス（`Digraph`、`Graph`、`Subgraph`）は、ここでも v4 のクラスです。グラフを自分で作る場合は `LegacyDigraph`、`LegacyGraph`、`LegacySubgraph` を使ってください。

```typescript
import { digraph, toDot } from 'ts-graphviz/legacy';

const G = digraph((g) => {
  g.node('a');
  g.node({ color: 'blue' }); // 3.x と同じく a も青になる
});

console.log(toDot(G));
// digraph {
//   node [
//     color = "blue";
//   ];
//   "a";
// }
```

## よくある質問

### エッジにだけ出てくるノードが `nodes` に入らない

```typescript
import { fromDot } from 'ts-graphviz';

const g = fromDot('digraph { a; a -> b; }');
console.log(g.nodes.map((n) => n.id)); // ['a']
console.log(g.getNodes('b')); // []
```

DOT では、エッジはそこに書かれたノードを作ります。一方、モデルはエッジの端点を id で記録するだけです。`nodes` が持つのはノード文として書かれたノードで、Graphviz から見たグラフのノードすべてではありません。ノードは複数のサブグラフに属することがあり、サブグラフの中の `a -> b` が外に書かれたノードを指すこともあるため、モデルは推測しません。`nodes` に入れたいノードは `g.addNode(new Node('b'))`（DSL では `dsl(g).node('b')`）で宣言するか、エッジの端点の id を読み取ってください。

### `isNodeModel(dsl)` が false になる

DSL はモデルの代わりになりますが、モデルそのものではないため、モデルの型ガード（`isNodeModel`、`isRootGraphModel` など）は DSL に対して false を返します。`$$type` か、モデルを確かめてください。

```typescript
import { digraph, isNodeModel, modelOf } from 'ts-graphviz';

digraph((g) => {
  const a = g.node('a');
  console.log(isNodeModel(a)); // false
  console.log(isNodeModel(modelOf(a))); // true
  console.log(a.$$type === 'Node'); // true
});
```

### 他の文の後に書いた既定値で 3.x の出力が変わった

v4 では、DOT と同じく、その既定値は後に書いたものにだけ適用されます。グラフ全体に適用したい既定値は他の文より前に書くか、当面は `ts-graphviz/legacy` から import して 3.x の出力を保ってください。

### `attributes` はどこへ行ったのか

`modelOf(g).attributes.node` は非推奨です。これはグラフ先頭の既定値だけを指します。`g.node({ ... })` が返す DSL を取っておき、それを通して既定値を変更してください。
