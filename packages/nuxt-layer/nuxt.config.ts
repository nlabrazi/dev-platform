export default defineNuxtConfig({
  runtimeConfig: {
    health: {
      service: '',
    },
    public: {
      umami: {
        websiteId: '',
        scriptUrl: 'https://umami.nabster.dev/script.js',
        domains: '',
        excludePaths: [] as string[],
        doNotTrack: true,
        autoTrack: true,
        enabled: '',
      },
      site: {
        name: '',
        url: '',
        description: '',
        ogImage: '',
        locale: 'fr_FR',
        twitterCard: 'summary_large_image',
      },
    },
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'fr',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
})
