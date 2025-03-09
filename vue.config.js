module.exports = {publicPath: ''};
const path = require('path')
const PrerendererWebpackPlugin = require('@prerenderer/webpack-plugin');

module.exports = {
  publicPath: '',

  configureWebpack: config => {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    return {
      plugins: [
        new PrerendererWebpackPlugin({
          // Absolute path to compiled SPA
          staticDir: path.resolve(__dirname, 'dist'),
          // List of routes to prerender
          routes: ['/'],
          renderer: '@prerenderer/renderer-puppeteer',
          rendererOptions: {
            renderAfterDocumentEvent: 'prerender-ready',
            headless: true,
          },
          postProcess(renderedRoute) {
            // Tell Vue to treat page as an already-rendered app and update it rather than completely rerendering the whole tree
            renderedRoute.html = renderedRoute.html.replace('id="app"', 'id="app" data-server-rendered="true"');

            return renderedRoute
          },
        }),
      ]
    }
  }
}
