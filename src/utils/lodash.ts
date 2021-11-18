/**
 * @desc lodash import
 */
/* tslint:disable:no-require-imports */
import { throttle as _throttle, debounce as _debounce } from 'throttle-debounce';
import isNull = require('lodash/isNull');
import isUndefined = require('lodash/isUndefined');
import isBoolean = require('lodash/isBoolean');
import isNumber = require('lodash/isNumber');
import isString = require('lodash/isString');
import isFunction = require('lodash/isFunction');
import isObject = require('lodash/isObject');
import min = require('lodash/min');
import max = require('lodash/max');
import sum = require('lodash/sum');
import isArray = require('lodash/isArray');
import findIndex = require('lodash/findIndex');
import find = require('lodash/find');
import last = require('lodash/last');
import first = require('lodash/first');
import includes = require('lodash/includes');
import uniq = require('lodash/uniq');
import clamp = require('lodash/clamp');
import pick = require('lodash/pick');
import omit = require('lodash/omit');
import toNumber = require('lodash/toNumber');
import flatten = require('lodash/flatten');
import cloneDeep = require('lodash/cloneDeep');
import set = require('lodash/set');

export function throttle(callback: (...args: any[]) => any, delay: number) {
  return _throttle(delay, false, callback);
}

export function debounce(callback: (...args: any[]) => any, delay: number) {
  return _debounce(delay, false, callback);
}

export {
  isNull,
  isUndefined,
  isBoolean,
  isNumber,
  isString,
  isFunction,
  isObject,
  min,
  max,
  sum,
  isArray,
  findIndex,
  find,
  last,
  first,
  includes,
  uniq,
  clamp,
  pick,
  omit,
  toNumber,
  flatten,
  cloneDeep,
  set,
};
