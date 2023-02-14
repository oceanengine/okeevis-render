var fs = require('fs')
var path = require('path')

var file = fs.readFileSync(path.resolve(__dirname, '../test/static/worker.js'));
var data = "export const worker = `" + file + "`;";
fs.writeFileSync(path.resolve(__dirname, '../src/multi-thread/worker-build.ts'), data)