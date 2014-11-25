var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var log = require('./log.js');

server.listen(port, ()=> {
  log.info('Server listening at port', port);
});

app.use(express.static(__dirname + '/client'));

io.on('connection', socket => {
    log.info('Connected');
    socket.emit('test', 'aaaa');
});