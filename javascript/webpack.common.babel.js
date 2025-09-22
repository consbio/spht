import path from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import BundleTracker from 'webpack-bundle-tracker'

export default {
  context: __dirname,
  entry: [
    'babel-polyfill',
    './src/index',
    './scss/spht.scss',
    'leaflet/dist/leaflet.css',
    'leaflet-basemaps/L.Control.Basemaps.css',
    'leaflet-zoombox/L.Control.ZoomBox.css',
    'leaflet-geonames/L.Control.Geonames.css',
    'leaflet-range/L.Control.Range.css',
    'leaflet-html-legend/dist/L.Control.HtmlLegend.css',
  ],
  plugins: [
    new BundleTracker({
      path: path.resolve('../'),
      filename: 'webpack-stats.json',
    }),
    new MiniCssExtractPlugin({ filename: '[name].bundle.css' }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve('./src'),
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.s?css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|gif)$/,
        type: 'asset/resource',
        generator: {
          filename: '[path][name].[hash].[ext]',
        },
      },
    ],
  },
  resolve: {
    modules: ['node_modules', './src'],
    extensions: ['.js'],
  },
}
