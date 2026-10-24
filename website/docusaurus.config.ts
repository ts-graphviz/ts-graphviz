import type * as Preset from '@docusaurus/preset-classic';
import npm2yarn from '@docusaurus/remark-plugin-npm2yarn';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';
import tsgraphviz from './plugins/remark-plugin-tsgraphviz';

const config: Config = {
  title: 'ts-graphviz',
  tagline:
    'Bringing the power of Graphviz to the TypeScript/JavaScript ecosystem.',
  favicon: 'img/favicon.ico',

  url: 'https://ts-graphviz.github.io',
  baseUrl: '/',

  organizationName: 'ts-graphviz',
  projectName: 'ts-graphviz',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja', 'zh-CN'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://pr.new/github.com//ts-graphviz/ts-graphviz.github.io/edit/main/',
          remarkPlugins: [
            [npm2yarn, { sync: true, converters: ['yarn', 'pnpm'] }],
            [tsgraphviz, {}],
          ],
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://pr.new/github.com//ts-graphviz/ts-graphviz.github.io/edit/main/',
          remarkPlugins: [
            [npm2yarn, { sync: true, converters: ['yarn', 'pnpm'] }],
            [tsgraphviz, {}],
          ],
        },
        pages: {
          remarkPlugins: [
            [npm2yarn, { sync: true, converters: ['yarn', 'pnpm'] }],
            [tsgraphviz, {}],
          ],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {
          trackingID: 'G-3GJJ15ETKQ',
          anonymizeIP: true,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image:
      'https://socialify.git.ci/ts-graphviz/ts-graphviz/image?description=1&font=Jost&forks=1&logo=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F63964583%3Fv%3D4&name=1&pattern=Circuit%20Board&pulls=1&stargazers=1&theme=Auto',
    navbar: {
      title: 'ts-graphviz',
      logo: {
        alt: 'ts-graphviz Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Guides',
        },
        { to: '/playground', label: 'Playground', position: 'left' },
        {
          href: 'https://ts-graphviz.github.io/ts-graphviz/',
          label: 'API Reference',
          position: 'left',
        },
        { to: '/blog', label: 'Blog', position: 'left' },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/ts-graphviz/ts-graphviz',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Tutorial',
              to: '/docs/ts-graphviz/introduction',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discussions',
              href: 'https://github.com/orgs/ts-graphviz/discussions',
            },
            {
              label: 'Open Collective',
              href: 'https://opencollective.com/ts-graphviz',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ts-graphviz.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['dot'],
    },
    algolia: {
      appId: 'NJUCHJD7F4',
      apiKey: '55c26969f6d0f1097060b505528086cc',
      indexName: 'ts-graphvizio',
    },
  } satisfies Preset.ThemeConfig,
  plugins: [
    async () => ({
      name: 'docusaurus-plugin-esmodule-shims',
      configureWebpack() {
        return {
          module: {
            rules: [
              {
                test: /\.m?js$/,
                resolve: {
                  fullySpecified: false,
                },
              },
            ],
          },
        };
      },
    }),
  ],
};

export default config;
