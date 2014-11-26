var delay = require('./promises.js').delay;

function Lock(){
    if(!(this instanceof Lock)){
        return new Lock();
    }

    this.promise = Promise.resolve();
}

Lock.prototype.lock = function(fn, timeout){
    var promise = this.promise;
    var e = {};
    if(timeout>0){
        promise = Promise.race([promise, delay(timeout, e)]);
    }
    this.promise = promise.then(function(value){
        if(e===value){
            fn(new Error("Timeout"));
            return Promise.resolve();
        }
        return new Promise(function(resolve){
            fn(undefined, resolve);
        });
    });
};

Lock.prototype.delay = function (time) {
    this.promise = this.promise.then(delay(time));
};

module.exports = Lock;
