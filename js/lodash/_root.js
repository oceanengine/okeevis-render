// eslint-disable-next-line no-var
var root = require('lodash/_root');

if (typeof root !== 'undefined' && !root.Date) {
  root.Date = Date;
}