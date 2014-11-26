var Lock = require("../dist/lock.js");
var promisify = require("../dist/promises.js").promisify;
var assert = require("assert");

describe('Lock', function(){
    it('should get new lock', function(done){
        Lock().lock(function(err){
            done(err);
        });
    });
    it('should timeout', function(done){
        var lock = Lock();
        lock.lock(function(err){
            assert.ifError(err);
        });
        lock.lock(function(err){
            if(err){
                done();
            }else{
                done(new Error('Not timeouted'));
            }
        },5);
    });
    it('should aquire lock two times', function(done){
        var lock = Lock();
        lock.lock(function(err, unlock){
            assert.ifError(err);
            unlock();
        });
        lock.lock(function(err){
            done(err);
        });
    });
    it('should timeuot due to delay', function(done) {
        var lock = Lock();
        lock.lock(function(err, unlock){
            assert.ifError(err);
            setTimeout(function () {
                unlock();
            }, 5);
        });
        lock.delay(100);
        lock.lock(function(err){
            if(err){
                done();
            }else{
                done(new Error('Not timeouted'));
            }
        },10);
    });
    it('should promisify Lock', function(done) {
        var l = Lock();
        var lock = promisify(Lock.prototype.lock, l);

        lock().then(function () {
            done();
        }).catch(done);
    });
    it('should reject promisified Lock due to timeout', function(done) {
        var l = Lock();
        var lock = promisify(Lock.prototype.lock, l);
        lock().then(function(){});
        lock(10).then(function () {
            done(new Error('Should not run'));
        }).catch(function(){
            done();
        });
    });
});
