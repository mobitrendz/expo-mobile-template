import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Expo Mobile Template',
  tagline: 'React Native + Expo SDK 54 task manager with FastAPI backend',
  favicon: 'img/favicon.png',

  future: {
    v4: true,
  },

  url: 'https://mobitrendz.github.io',
  baseUrl: '/expo-mobile-template/',

  organizationName: 'mobitrendz',
  projectName: 'expo-mobile-template',

  onBrokenLinks: 'throw',

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/logo.png',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Expo Mobile Template',
      logo: {
        alt: 'Expo Mobile Template',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/mobitrendz/fastapi-backend-template',
          label: 'MobiTrendz Backend',
          position: 'right',
        },
        {
          href: 'https://github.com/mobitrendz/react-frontend-template',
          label: 'MobiTrendz Web',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {label: 'Introduction', to: '/docs/intro'},
            {label: 'Getting started', to: '/docs/getting-started'},
            {label: 'Troubleshooting', to: '/docs/reference/troubleshooting'},
          ],
        },
        {
          title: 'MobiTrendz Ecosystem',
          items: [
            {
              label: 'MobiTrendz FastAPI Backend',
              href: 'https://github.com/mobitrendz/fastapi-backend-template',
            },
            {
              label: 'MobiTrendz React Frontend',
              href: 'https://github.com/mobitrendz/react-frontend-template',
            },
            {
              label: 'Expo SDK 54',
              href: 'https://docs.expo.dev/versions/v54.0.0/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} MobiTrendz. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
