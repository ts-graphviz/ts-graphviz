---
description: ts-graphviz 的安全策略。
draft: true
---
# 安全策略

## 目的与重要性

在当今的软件开发环境中，**开源软件 (OSS)** 在构建应用程序中扮演着不可或缺的角色。根据 **开源安全基金会 (OpenSSF)** 的数据，**70% 到 90%** 的现代应用程序由 OSS 组件组成，其依赖关系的复杂性每天都在增加[^1]。

[^1]: Behlendorf, B. (2022年5月11日)。*Brian Behlendorf 在国会就开源软件安全性作证*（原文为英文）。Linux基金会。取自 [https://www.linuxfoundation.org/blog/blog/lf/brian-behlendorf-testifies-open-source-software-security](https://www.linuxfoundation.org/blog/blog/lf/brian-behlendorf-testifies-open-source-software-security)

### ts-graphviz 的影响与责任

**ts-graphviz** 是一个广泛使用的库，每月下载量超过200万次，影响着各种应用程序。即使是不直接与 ts-graphviz 交互的用户，也会通过依赖该库的软件受到影响。

> ![依赖关系](https://imgs.xkcd.com/comics/dependency.png)
>
> *软件依赖关系的示意图（来源：[xkcd.com/2347](https://xkcd.com/2347/))*

这个示意图强调了现代软件如何依赖于众多底层组件。

**确保 ts-graphviz 的安全性至关重要，因为漏洞可能会通过依赖关系级联，潜在地影响无数应用程序。**

## 对安全的承诺

ts-graphviz 致力于不仅仅提供安全的源代码。我们实施了**全面的安全措施**，考虑到了**整个软件供应链**。这种专注确保用户能够自信地采用 ts-graphviz，知道它有助于构建安全可靠的应用程序。

## 软件供应链安全

认识到现代应用程序在很大程度上依赖于开源软件，我们实施了防范依赖链中漏洞的实践。

## 报告漏洞

我们鼓励用户和安全研究人员报告任何漏洞或安全问题。及时的报告使我们能够迅速解决问题，维护库的完整性和安全性。
