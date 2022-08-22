import { name, shortName, description, ogImage, ogUrl, font } from './meta'

export default {
  lang: 'en-US',
  title: 'Stateful Mock Server',
  description: 'Smart GraphQL Mocking Server, Powered by XState',
  head: [
    ['meta', { name: 'theme-color', content: '#ffffff' }],
    ['link', { rel: 'icon', href: '/stateful-mock-server-dark.svg', type: 'image/svg+xml' }],
    // ['link', { rel: 'alternate icon', href: '/favicon.ico', type: 'image/png', sizes: '16x16' }],
    ['meta', { name: 'author', content: `Bitovi` }],
    [
      'meta',
      {
        name: 'keywords',
        content: 'graphql, mocks, mock graphql, xstate, server, mockingbird',
      },
    ],
    ['meta', { property: 'og:title', content: name }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: ogUrl }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { name: 'twitter:title', content: name }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: ogImage }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['link', { href: font, rel: 'stylesheet' }],
    ['link', { rel: 'mask-icon', href: '/logo.svg', color: '#ffffff' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' }],
  ],
  themeConfig: {
    siteTitle: 'Stateful Mock Server',
    logo: '/stateful-mock-server-dark.svg',
    footer: {
      message: 'Built with ❤️ by Bitovi',
    },
    editLink: {
      pattern: 'https://github.com/bitovi/stateful-mocks/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    sidebar: [
      {
        text: 'Guides',
        items: [
          { text: 'Getting Started', link: '/get-started' },
          // { text: 'Understanding Mocks', link: '/getting-started' },
        ],
      },
    ],
  },
}
