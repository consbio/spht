import path from 'path'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import BundleTracker from "webpack-bundle-tracker"

export default {
    context: __dirname,
    entry: [
        './src/index',
        './scss/spht.scss'
    ],
    plugins: [
        new BundleTracker({filename: '../webpack-stats.json'}),
        new ExtractTextPlugin({filename: '[name].bundle.css'})
    ],
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
            },
            {
                test: /\.(png|gif)$/,
                loader: 'file-loader'
            }
        ]
    },
    resolve: {
        modules: ['node_modules', './src'],
        extensions: ['.js']
    }
}
