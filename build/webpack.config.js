const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const root = path.resolve(__dirname, '../');
const htmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

function isDir(path) {
    const stat = fs.lstatSync(path);
    return stat.isDirectory();
}

const testDir = path.resolve(__dirname, '../test');
const testEntry = {
};
const htmlPluginList = [];
fs.readdirSync(testDir).map(file => {
    const entryPath = path.resolve(testDir, file);
    if(!isDir(entryPath) && /index.ts$/g.test(file)) {
        const content = fs.readFileSync(entryPath).toString('utf8');
        const matchTemplates = content.match(/(?<=@template\s+)\S+(?=\s)/g);
        const template = matchTemplates ? matchTemplates[0] : 'index.html';
        const key = file.replace(/\.[^.]+$/g, '')
        testEntry[key] = [
            'webpack-hot-middleware/client?quiet=true&reload=true',
            path.resolve(root, 'test', file)
        ];
        const templateFile = path.resolve(root, 'test/template/', template);
        htmlPluginList.push(new htmlWebpackPlugin({
            filename: key + '.html',
            template: templateFile,
            chunks: [key],
            inject: true,
            testEntry: testEntry,
        }))
    }
})
module.exports = {
    devtool: 'source-map',

    entry: testEntry,

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
                test: /\.(jpg|gif|png|svg)$/,
                loader: 'url-loader',
                options: {
                    limit: 8192,
                },
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
            },
            {
                test: /\.pug$/,
                loader: 'pug-loader',
            },
            {
                test: /\.styl$/,
                // loader: 'stylus-loader',
                loader: 'style-loader!css-loader!stylus-loader',
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
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader', //添加对样式表的处理
            },
        ],
    },
    plugins: [
        new BundleAnalyzerPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"devlopment"',
            },
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
    ].concat(htmlPluginList),
};
