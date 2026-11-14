---
description: ts-graphvizのセキュリティポリシー
---
# セキュリティポリシー

## 目的と重要性

今日のソフトウェア開発環境において、 **オープンソースソフトウェア（OSS）** はアプリケーション構築において欠かせない役割を果たしています。
**Open Source Security Foundation（OpenSSF）** によると、 **現代のアプリケーションの70%から90%** はOSSコンポーネントで構成されており[^1]、その依存関係の複雑さは日々増しています。

[^1]: Behlendorf, B. (2022, May 11). *Brian Behlendorf Testifies to Congress on Open Source Software Security*. The Linux Foundation. Retrieved from [https://www.linuxfoundation.org/blog/blog/lf/brian-behlendorf-testifies-open-source-software-security](https://www.linuxfoundation.org/blog/blog/lf/brian-behlendorf-testifies-open-source-software-security)

### ts-graphvizの影響と責任

**ts-graphviz**は月間200万ダウンロードを超える広く利用されているライブラリであり、幅広いアプリケーションに影響を与えています。ts-graphvizと直接やり取りしないユーザーであっても、それに依存するソフトウェアを通じて影響を受けます。

> ![Dependency](https://imgs.xkcd.com/comics/dependency.png)
>
> *ソフトウェア依存関係のイラスト（出典: [xkcd.com/2347](https://xkcd.com/2347/))*

このイラストは、現代のソフトウェアがどれだけ多くの基盤コンポーネントに依存しているかを強調しています。

**ts-graphvizのセキュリティを確保することは、脆弱性が依存関係を通じて連鎖的に広がり、無数のアプリケーションに影響を及ぼす可能性があるため、非常に重要です。**

## セキュリティへの取り組み

ts-graphvizは、安全なソースコードの提供以上のことにコミットしています。**包括的なセキュリティ対策**を実施し、**ソフトウェアサプライチェーン全体**を考慮しています。この献身により、ユーザーはts-graphvizを安心して採用でき、安全で信頼性の高いアプリケーションの構築に貢献していることを理解できます。

## ソフトウェアサプライチェーンのセキュリティ

現代のアプリケーションがオープンソースソフトウェアに大きく依存していることを認識し、依存関係チェーン全体の脆弱性から保護するための実践を導入しています。

実施している対策:

- **CodeQL 解析**: [![CodeQL](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/codeql-analysis.yml)
  - JavaScript/TypeScript のコードに脆弱性がないかを調べます。main への push、プルリクエスト、毎週の定期実行で動き、結果は GitHub のコードスキャンのダッシュボードに送られます。
- **CI での継続的なテストと静的解析**: [![Main](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/main.yaml/badge.svg)](https://github.com/ts-graphviz/ts-graphviz/actions/workflows/main.yaml)
  - CI でテストと静的解析を行います。main ブランチにマージする前に、コードがテストされ、問題が解決されていることを確かめます。
- **Provenance**: [![Provenance](https://img.shields.io/badge/npm_package-provenanced-green)](https://www.npmjs.com/package/ts-graphviz)
  - [npm provenance](https://docs.npmjs.com/generating-provenance-statements) は、npm パッケージの完全性と出所を利用者が検証できる仕組みです。パッケージが信頼でき、改ざんされていないことを確かめられます。
- **再現可能なビルド**: プルリクエストごと、および `main` と `next` への push ごとに、別々のランナーでパッケージを 2 回ビルドして pack し、tarball が一致しなければ失敗します。公開されたバージョンを自分でビルドし直す方法は[リリースの検証](#verifying-a-release)を参照してください。
- **OpenSSF Scorecard**: [![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/ts-graphviz/ts-graphviz/badge)](https://scorecard.dev/viewer/?uri=github.com/ts-graphviz/ts-graphviz)
  - サプライチェーンのセキュリティを評価します。ブランチ保護、メンテナンスの状況、その他のセキュリティの実践を確認します。Scorecard はセキュリティリスクを自動で確認・評価する CLI ツールで、GitHub Actions などの CI に組み込んで継続的に評価できます。結果は OpenSSF の API に公開され、セキュリティバッジが作られます。スコアはレポートとして公開されます。
- **OpenSSF Best Practices バッジ**: [![OpenSSF Best Practices](https://www.bestpractices.dev/projects/8396/badge)](https://www.bestpractices.dev/projects/8396)
  - セキュリティに関する質問に答え、ベストプラクティスに従うことで、このバッジの基準を満たすことを目指しています。パッケージをより安全にするための取り組みです。
- **エンタープライズサポート**: [![Tidelift](https://tidelift.com/badges/package/npm/ts-graphviz?style=flat)](https://tidelift.com/subscription/pkg/npm-ts-graphviz?utm_source=npm-ts-graphviz&utm_medium=readme)
  - Tidelift サブスクリプションの一部として利用できます。ts-graphviz をはじめ数千のパッケージのメンテナーが Tidelift と協力し、アプリケーションの構築に使うオープンソースの依存関係について、商用のサポートとメンテナンスを提供しています。使っている依存関係のメンテナーに対価を払いながら、時間を節約し、リスクを減らし、コードの健全性を高められます。[詳しくはこちら](https://tidelift.com/subscription/pkg/npm-ts-graphviz?utm_source=npm-ts-graphviz&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)。

### リリースの検証 {#verifying-a-release}

パッケージは再現可能な形でビルドされます。同じコミットを 2 回ビルドすると、同じバイト列の tarball ができます。`pnpm pack` は固定のタイムスタンプ（1985-10-26）、所有者なし、固定のエントリ順で tarball を書き出し、ビルドは日付・ソースマップ・絶対パスを出力に書き込みません。CI は変更のたびに、2 回のクリーンビルドが一致することを確かめます（`pnpm pack:check` で同じ確認を手元で実行できます）。

そのため、公開されたバージョンを git タグからビルドし直し、npm が配布しているものと比べられます。各パッケージには `<name>@<version>` のタグが付いています（例: `ts-graphviz@3.0.13`、`@ts-graphviz/ast@3.0.7`）。ビルドには、そのタグ時点の `.node-version` にあるバージョンの Node.js と、`package.json` の `packageManager` にある pnpm のバージョンが必要です（Corepack または `pnpm env` でインストールできます）。出力は、それらのバージョンが固定するバンドラーと型宣言のツールから作られるためです。

```bash
mkdir npm local

# npm が配布しているリリース
npm view ts-graphviz@3.0.13 dist.integrity dist.tarball
npm pack ts-graphviz@3.0.13 --pack-destination npm

# 同じバージョンをタグからビルドしたもの
git clone https://github.com/ts-graphviz/ts-graphviz.git
cd ts-graphviz
git checkout ts-graphviz@3.0.13
pnpm install --frozen-lockfile
pnpm codegen
pnpm build
pnpm --filter ts-graphviz pack --pack-destination ../local

# 比較
cd ..
sha256sum npm/*.tgz local/*.tgz
mkdir npm-x local-x
tar -xzf npm/*.tgz -C npm-x
tar -xzf local/*.tgz -C local-x
diff -r npm-x local-x
```

期待される結果:

- `package/lib` 以下のファイル、README、CHANGELOG、LICENSE は一致します。
- `package/package.json` は異なることがありますが、違いは形式だけです。pnpm は pack 時と publish 時に内部依存の `workspace:` の範囲をバージョンに置き換えますが、この 2 つはキーを必ずしも同じ順で書きません。レジストリや publish の手順が、手元の pack にはないフィールド（`_id`、`gitHead`、`_integrity`、`_resolved`、`_npm*` など）を足すこともあります。キーを並べ替えてから比べてください（`jq -S . npm-x/package/package.json > a; jq -S . local-x/package/package.json > b; diff a b`）。このファイルがあるため、tarball のチェックサム（`dist.integrity`、`dist.shasum`）は手元の pack とバイト単位で一致するとは限りません。中のファイルは一致します。（`ts-graphviz@3.0.13` で確認済み: `dependencies` の 2 つのキーの順序以外はすべて一致。）
- `npm audit signatures` は、インストールした各パッケージのレジストリ署名と provenance の証明を確かめます。これにより tarball が、それを公開した GitHub Actions の実行とコミットに結び付きます。ビルドし直すことで、公開されたファイルがそのコミットから作られるものであることを、npm とは独立に確かめられます。

`lib/` 以下のファイルが異なる場合は、両方の tarball のチェックサム、タグ、使った Node.js と pnpm のバージョンを添えて、非公開で報告してください（[SECURITY.md](https://github.com/ts-graphviz/ts-graphviz/blob/main/SECURITY.md) を参照）。

## 脆弱性の報告

ユーザーやセキュリティ研究者には、脆弱性やセキュリティ上の懸念事項を報告することを奨励します。迅速な報告により、問題を速やかに対処し、ライブラリの整合性とセキュリティを維持することが可能になります。

脆弱性は [SECURITY.md](https://github.com/ts-graphviz/ts-graphviz/blob/main/SECURITY.md) の手順に従って非公開で報告してください。報告の対象になるものは[セキュリティモデル](/docs/ts-graphviz/advanced-topics/security-model)に書かれています。
