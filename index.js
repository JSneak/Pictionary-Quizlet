const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

var firebase = require('firebase');
var app = firebase.initializeApp({});



io.on('connection', function(socket) {
  function onConnection(socket) {
    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
  }
  onConnection();

  function roundStartTimer {

  }
});

http.listen(port, () => console.log('listening on port ' + port));
