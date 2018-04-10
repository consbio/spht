import path from 'path'

export default {
    context: __dirname,
    entry: './src/index',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    devServer: {
        contentBase: './',
        hot: true,
        host: '127.0.0.1',
        port: 3000,
        inline: true,
        publicPath: '/webpak/',
        stats: ['minimal', 'color']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve('./src'),
                loader: 'babel-loader',
                query: {presets: ['es2015', 'react']}
            }
        ]
    },
    resolve: {
        modules: ['node_modules', './src'],
        extensions: ['.js']
    },
    mode: 'development'
}
