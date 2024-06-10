import { throttle as _throttle, debounce as _debounce } from 'throttle-debounce';
import isNull from 'lodash-es/isNull';
import isUndefined from 'lodash-es/isUndefined';
import isBoolean from 'lodash-es/isBoolean';
import isNumber from 'lodash-es/isNumber';
import isString from 'lodash-es/isString';
import isFunction from 'lodash-es/isFunction';
import isObject from 'lodash-es/isObject';
import min from 'lodash-es/min';
import max from 'lodash-es/max';
import sum from 'lodash-es/sum';
import minBy from 'lodash-es/minBy';
import maxBy from 'lodash-es/maxBy';
import isArray from 'lodash-es/isArray';
import findIndex from 'lodash-es/findIndex';
import find from 'lodash-es/find';
import last from 'lodash-es/last';
import first from 'lodash-es/first';
import includes from 'lodash-es/includes';
import uniq from 'lodash-es/uniq';
import clamp from 'lodash-es/clamp';
import pick from 'lodash-es/pick';
import omit from 'lodash-es/omit';
import toNumber from 'lodash-es/toNumber';
import flatten from 'lodash-es/flatten';
import cloneDeep from 'lodash-es/cloneDeep';
import set from 'lodash-es/set';

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
  minBy,
  maxBy,
};
