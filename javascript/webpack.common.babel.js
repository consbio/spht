import path from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import BundleTracker from "webpack-bundle-tracker"

export default {
    context: __dirname,
    entry: [
        'babel-polyfill',
        './src/index',
        './scss/spht.scss'
    ],
    plugins: [
        new BundleTracker(
    {
                path: path.resolve('../' ),
                filename: 'webpack-stats.json',
            }
        ),
        new MiniCssExtractPlugin({filename: '[name].bundle.css'})
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve('./src'),
                use: [
                    {
                        loader: 'babel-loader',
                    }
                ]
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            },
            {
                test: /\.(png|gif)$/,
                type: 'asset/resource',
                generator: {
                    filename: '[path][name].[hash].[ext]'
                }
            }
        ]
    },
    resolve: {
        modules: ['node_modules', './src'],
        extensions: ['.js']
    }
}
