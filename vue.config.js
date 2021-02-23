const autoprefixer = require('autoprefixer')
const pxtoviewport = require('postcss-px-to-viewport')

module.exports = {
  outputDir: 'dist',
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          autoprefixer(),
          pxtoviewport({
            viewportWidth: 750,
            unitPrecision: 2
          })
        ]
      }
    }
  }
}
