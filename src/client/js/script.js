var angular = require('angular-bsfy');
var bootstrap = require('../../3rd/bootstrap.js');
var p = require('../../promises.js');
var socket = require('./angular-socket.js');
var log = require('../../log.js');
require('regenerator/runtime.js');

var delay = p.delay;
var spawn = p.spawnf;

var app = angular
    .module('myApp', [socket.name, bootstrap])
    .factory('mySocket', socketFactory=> socketFactory());

app.controller('Ctrl', ($scope, mySocket) => {
    $scope.counter = 0;

    var gen = (function*(){
        var i = 0;
        while(true){
            i += 1;
            yield i;
        }
    })();

    mySocket.on('test', msg=>log.info(msg));

    $scope.next = spawn(function*(){
        while(true){
            yield delay(2000);
            $scope.$apply(()=>{
                $scope.counter = gen.next().value;
            });
        }
    });
});
