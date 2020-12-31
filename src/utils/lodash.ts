/**
 * @desc lodash import
 */
/* tslint:disable:no-require-imports */
import isNull = require('lodash/isNull');
import isUndefined = require('lodash/isUndefined');
import isBoolean = require('lodash/isBoolean');
import isNumber = require('lodash/isNumber');
import isString = require('lodash/isString');
import isFunction = require('lodash/isFunction');
import min = require('lodash/min');
import max = require('lodash/max');
import isArray = require('lodash/isArray');
import shuffle = require('lodash/shuffle');
import findIndex = require('lodash/findIndex');
import find = require('lodash/find');
import merge = require('lodash/merge');
import last = require('lodash/last');
import first = require('lodash/first');
import inRange = require('lodash/inRange');
import includes = require('lodash/includes');
import clamp = require('lodash/clamp');
import pick = require('lodash/pick');
import omit = require('lodash/omit');
import assign = require('lodash/assign');
import throttle = require('lodash/throttle');
import template = require('lodash/template');
import set = require('lodash/set');
import get = require('lodash/get');
import toNumber = require('lodash/toNumber');
import mergeWith = require('lodash/mergeWith');
import flatten = require('lodash/flatten');
import map = require('lodash/map');
import filter = require('lodash/filter');
import uniq = require('lodash/uniq');
import orderBy = require('lodash/orderBy');
import sum = require('lodash/sum');
import trim = require('lodash/trim');
import keys = require('lodash/keys');
import intersection = require('lodash/intersection');
import difference = require('lodash/difference');
import sortBy = require('lodash/sortBy');
// import root = require('lodash/_root')

// if (typeof root !== 'undefined' && !root.Date) {
//   root.Date = Date;
// }

export {
  isNull,
  isUndefined,
  isBoolean,
  isNumber,
  isString,
  isFunction,
  min,
  max,
  isArray,
  shuffle,
  findIndex,
  find,
  last,
  first,
  inRange,
  includes,
  clamp,
  pick,
  omit,
  throttle,
  template,
  set,
  get,
  toNumber,
  assign,
  merge,
  mergeWith,
  flatten,
  map,
  filter,
  uniq,
  orderBy,
  sum,
  trim,
  keys,
  intersection,
  difference,
  sortBy,
};
