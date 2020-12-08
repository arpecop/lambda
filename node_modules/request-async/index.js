/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-01-29
 * @author Liang <liang@maichong.it>
 */

'use strict';

let request = require('request');

let promisify = function (fn) {
  let context = this;
  return function () {
    let args = Array.prototype.slice.call(arguments);
    return new Promise(function (resolve, reject) {
      return fn.apply(context, args.concat(function (err) {
        if (err) {
          reject(err);
        } else {
          resolve.apply(this, Array.prototype.slice.call(arguments, 1));
        }
      }));
    });
  }
};

let promisifyRequest = function (request) {
  let fn = promisify(request);
  fn.jar = request.jar;
  fn.cookie = request.cookie;

  ['get', 'patch', 'post', 'put', 'head', 'del'].forEach(function (method) {
    fn[method] = promisify.call(request, request[method]);
  });
  return fn;
};

exports = module.exports = promisifyRequest(request);

exports.Request = request.Request;

exports.defaults = function () {
  return promisifyRequest(request.defaults.apply(request, arguments));
};

exports.forever = function () {
  return promisifyRequest(request.forever.apply(request, arguments));
};
