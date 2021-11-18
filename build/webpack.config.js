const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const root = path.resolve(__dirname, '../');
const htmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
    devtool: 'source-map',

    entry: {index: [path.resolve(root, 'test/index.ts'), 'webpack-hot-middleware/client?quiet=true&reload=true'] },

    output: {
        path: root + '/',
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
        // new BundleAnalyzerPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"devlopment"',
            },
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new htmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(root, 'index.html'),
            inject: true,
        })
    ]
};
