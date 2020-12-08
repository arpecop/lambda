const requireFromString = require('require-from-string');

const request = require('request');
const memored = require('memored');

async function lambda(funid, params, callback) {
  memored.read(funid, (err, value) => {
    request.get(
      `https://raw.githubusercontent.com/arpecop/lambda/functions/functions/${funid}.fun.js`,
      (e, r, contents) => {
        const funct = requireFromString(contents);
        memored.store(funid, { cached: contents }, () => {});
        if (!value && !params.noexec) {
          funct.go(params, data => {
            callback(data);
          });
        }
      }
    );
    if (params.noexec) {
      callback({});
    }
    if (value && !params.noexec) {
      const funct = requireFromString(value.cached);
      funct.go(params, data => {
        callback(data);
      });
    }
  });
}

module.exports = {
  lambda
};
