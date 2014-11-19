"use strict";

var delay = function (ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
};

var promisify = function (fn, receiver) {
  return function () {
    var slice = Array.prototype.slice, args = slice.call(arguments, 0, fn.length - 1), promise = new Promise();

    args.push(function () {
      var results = slice.call(arguments), error = results.shift();

      if (error) promise.reject(error);else promise.resolve.apply(promise, results);
    });

    fn.apply(receiver, args);
    return promise;
  };
};

var spawn = function (generator) {
  var process = function (result) {
    result.value.then(function (value) {
      if (!result.done) {
        process(sequence.next(value));
      }
    });
  };

  var sequence = generator();
  var next = sequence.next();
  process(next);
};

var spawnf = function (gen) {
  return function () {
    return spawn(gen);
  };
};

module.exports = {
  delay: delay,
  promisify: promisify,
  spawn: spawn,
  spawnf: spawnf
};