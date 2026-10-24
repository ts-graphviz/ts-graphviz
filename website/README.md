# Website

The documentation site at https://ts-graphviz.github.io/, built with [Docusaurus](https://docusaurus.io/). It lives in this monorepo so that docs and code change in the same pull request; the repository `ts-graphviz/ts-graphviz.github.io` is only the deployment target (`gh-pages` branch), pushed by the `Website` workflow on every push to `main`.

## Development

Install from the repository root, then build the packages once: the playground's type definitions (`static/dts.json`) are generated from them by `start` and `build`.

```bash
pnpm install
pnpm build
pnpm --filter @ts-graphviz/website start       # en
pnpm --filter @ts-graphviz/website start:ja    # ja
pnpm --filter @ts-graphviz/website start:zh    # zh-CN
```

`pnpm build:website` at the root builds the packages, the API reference (typedoc) and the site, and copies the API reference to `build/api/` (`copy-api`), exactly as the deploy workflow does.

## Layout

- `docs/` — guides (English source); translations in `i18n/<locale>/docusaurus-plugin-content-docs/current/`
- `blog/` — release notes and announcements; translations in `i18n/<locale>/docusaurus-plugin-content-blog/`
- `src/` — the landing page, the playground (WebContainer + Graphviz WASM) and the live editor used in code blocks
- `plugins/remark-plugin-tsgraphviz.ts` — turns ` ```ts tsgraphviz ` code blocks into live editors
- `scripts/extract-dts.mts` — collects the packages' `.d.ts` files for the editor
- `scripts/copy-api-reference.mts` — puts the typedoc output under `build/api/`
- `scripts/check-links.mts` — crawls the built site and fails on broken internal links (`pnpm check-links`; runs in CI)

## Translations

After changing English docs, update the locale files with `pnpm --filter @ts-graphviz/website write-translations:ja` (or `:zh`) and translate the new strings; keep the `i18n/` trees in sync with `docs/` and `blog/`.
