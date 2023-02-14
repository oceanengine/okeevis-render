const path = require('path');
const root = path.resolve(__dirname, '../');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    devtool: false,

    entry: {
        worker: path.resolve(root, './src/multi-thread/worker.ts')
    },
    output: {
        path: root + '/test/static',
        publicPath: '/',
        filename: '[name].js',
    },

    resolve: {
        extensions: ['json', '.js', '.ts', '.tsx'],
        alias: {
            ASSETS: path.resolve(__dirname, '../assets'),
            Core: path.resolve(__dirname, '../src/core'),
            Lib: path.resolve(__dirname, '../src/lib'),
        },
    },

    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
            },
            {
                test: /\.json$/,
                loader: 'json-loader',
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                include: root,
            }
        ],
    },
    plugins: [
        new UglifyJsPlugin({
        uglifyOptions: {
            compress: {
                warnings: false,
            },
        },
        sourceMap: false,
        parallel: true,
        })
    ]
};
