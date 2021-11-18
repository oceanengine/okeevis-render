/* eslint-disable */
var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var path = require('path');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');

var root = path.resolve(__dirname, '../').replace(/\\/g, '/') + '/';
var assetsRoot = path.resolve(root, 'dist');
var assetsSubDirectory = 'static/';
var productionSourceMap = true;
var productionGzip = false;

var devWebpackConfig = require('./webpack.config.js');

devWebpackConfig.plugins = [];

var prodWebpackConfig = {
    devtool: productionSourceMap ? '#source-map' : false,
    entry: root + '/src/index.ts',
    output: {
        path: assetsRoot,
        library: 'OkeeRender',
        libraryTarget: 'umd',
        filename: 'okee-render.min.js',
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"',
            },
        }),
        new UglifyJsPlugin({
            uglifyOptions: {
                compress: {
                    warnings: false,
                },
            },
            sourceMap: false,
            parallel: true,
        }),
    ],
};

if (productionGzip) {
    var CompressionWebpackPlugin = require('compression-webpack-plugin');

    webpackConfig.plugins.push(
        new CompressionWebpackPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: new RegExp(
                '\\.(' + config.build.productionGzipExtensions.join('|') + ')$',
            ),
            threshold: 10240,
            minRatio: 0.8,
        }),
    );
}

module.exports = webpackMerge(devWebpackConfig, prodWebpackConfig);
