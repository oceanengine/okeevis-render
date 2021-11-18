/* eslint-disable */

console.log(
    '    Tip:\n' +
        '    Built files are meant to be served over an HTTP server.\n' +
        "    Opening index.html over file:// won't work.\n",
);

var ora = require('ora');
var spinner = ora('building for production...');
spinner.start();


var webpack = require('webpack');
var webpackConfig = require('./webpack.config.build.js');
webpack(webpackConfig, function(err, stats) {
    spinner.stop();
    if (err) throw err;
    process.stdout.write(
        stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false,
        }) + '\n',
    );
});
