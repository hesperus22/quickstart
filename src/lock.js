function Lock(){
    if(!(this instanceof Lock)){
        return new Lock();
    }
        
    this.promise = Promise.resolve();
}

Lock.prototype.lock = function(fn){
    this.promise = this.promise.then(function(){
        return new Promise(function(resolve){
            fn(resolve);
        });
    });
};

module.exports = Lock;