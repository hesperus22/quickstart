"use strict";

var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log("Server listening at port %d", port);
});

app.use(express["static"](__dirname + "/client"));

io.on("connection", function (socket) {
  console.log("Connected");
  socket.emit("test", "aaaa");
});