import path from 'path'
import BundleTracker from 'webpack-bundle-tracker'
import ExtractTextPlugin from 'extract-text-webpack-plugin'

export default {
    context: __dirname,
    entry: [
        'webpack-dev-server/client?http://localhost:3000',
        'webpack/hot/only-dev-server',
        './src/index',
        './scss/spht.scss'
    ],
    output: {
        path: path.resolve(__dirname, 'webpack_bundles'),
        filename: '[name].bundle.js',
        publicPath: 'http://localhost:3000/assets/bundles/',
        crossOriginLoading: 'anonymous'
    },
    plugins: [
        new ExtractTextPlugin({filename: '[name].bundle.css'}),
        new BundleTracker({filename: '../webpack-stats.json'})
    ],
    devServer: {
        contentBase: './',
        hot: true,
        host: '127.0.0.1',
        port: 3000,
        inline: true,
        publicPath: '/assets/bundles/',
        stats: ['minimal', 'color'],
        headers: { "Access-Control-Allow-Origin": "*" }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve('./src'),
                loader: 'babel-loader',
                query: {presets: ['es2015', 'react']}
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'sass-loader']
                })

            }
        ]
    },
    resolve: {
        modules: ['node_modules', './src'],
        extensions: ['.js']
    }
}
