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

## 脆弱性の報告

ユーザーやセキュリティ研究者には、脆弱性やセキュリティ上の懸念事項を報告することを奨励します。迅速な報告により、問題を速やかに対処し、ライブラリの整合性とセキュリティを維持することが可能になります。
