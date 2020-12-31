var webpackConfig = require('./webpack.config.js');
var webpack = require('webpack');
var compiler = webpack(webpackConfig);
var opn = require('opn');
var path = require('path');
var devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: {
        colors: true,
        chunks: false,
    },
});

var hotMiddleware = require('webpack-hot-middleware')(compiler);
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function(compilation) {
    compilation.plugin('html-webpack-plugin-after-emit', function(data, cb) {
        hotMiddleware.publish({ action: 'reload' });
        cb();
    });
});

// server
var express = require('express');
var app = express();

// serve webpack bundle output
app.use(devMiddleware);

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware);

// api
var port = 9610;
app.use('/', express.static(path.resolve(__dirname, '../test/static')));
module.exports = app.listen(port, function(err) {
    if (err) {
        console.log(err);
        return;
    }
    var uri = 'http://127.0.0.1:' + port;
    console.log('Listening at ' + uri + '\n');
    opn(`http://127.0.0.1:${port}/index.html`);
});
