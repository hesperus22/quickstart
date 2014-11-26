var delay = (ms, value) => new Promise(resolve => setTimeout(resolve(value), ms));

var promisify = function(fn, receiver) {
  return function() {
    var slice = Array.prototype.slice,
      args = slice.call(arguments, 0, fn.length - 1),
      resolver = {};
    var promise = new Promise((resolve, reject)=>{
        resolver.reject = reject;
        resolver.resolve = resolve;
    });

    args.push(function() {
      var results = slice.call(arguments),
        error = results.shift();

      if (error) {
        resolver.reject(error);
      } else {
        resolver.resolve(results);
      }
    });

    fn.apply(receiver, args);
    return promise;
  };
};

var spawn = function(generator) {
  let sequence = generator();

  var process = function(result) {

    result.value.then(function(value) {
      if (!result.done) {
        process(sequence.next(value));
      }
    });
  };

  let next = sequence.next();
  process(next);
};

var spawnf = gen => () => spawn(gen);

module.exports = {
  delay: delay,
  promisify: promisify,
  spawn: spawn,
  spawnf: spawnf
};
