import path from 'path'
import merge from 'webpack-merge'
import common from './webpack.common.babel.js'

export default merge(common, {
  mode: 'development',
  devServer: {
    hot: false,
    host: '127.0.0.1',
    port: 3000,
    headers: { 'Access-Control-Allow-Origin': '*' },
    devMiddleware: {
      index: true,
      publicPath: 'http://127.0.0.1:3000/assets/bundles/',
    },
    allowedHosts: 'all',
  },
  output: {
    path: path.resolve(__dirname, 'webpack_bundles'),
    filename: '[name].bundle.js',
    publicPath: 'http://localhost:3000/assets/bundles/',
    crossOriginLoading: 'anonymous',
  },
})
