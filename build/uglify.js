var UglifyJS = require('uglify-js');
var fs = require('fs');
var path = require('path');
var rootPath = path.resolve(__dirname, '../lib/multi-thread');
var files = fs.readdirSync(rootPath);
files.forEach(file => {
  if (/\.js$/gi.test(file)) {
    const filePath = path.resolve(rootPath, file);
    const code = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const result = UglifyJS.minify(code);
    fs.writeFileSync(filePath, result.code);
  }
});
