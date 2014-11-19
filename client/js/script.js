var angular = require('angular-bsfy');
var inherits = require('inherits');
var p = require('../../promises.js');
var socket = require('./angular-socket.js');

var app = angular
    .module('myApp', [socket.name])
    .factory('mySocket', socketFactory=> socketFactory());

app.controller('Ctrl', ($scope, mySocket) => {
    $scope.counter = 0;
    
    var gen = function*(){
        var i = 0;
        while(true)
            yield ++i;
    }();
    
    mySocket.on('test', msg=>console.log(msg));
    
    $scope.next = p.spawnf(function*(){
            while(true){
                yield p.delay(1000);
                $scope.$apply(()=>{
                    $scope.counter = gen.next().value;
                });
            }
        });
}); 