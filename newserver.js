const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
app.use(express.static(__dirname + '/newPublic'));

var Rooms = []; //List of all rooms with codes.


io.on('connection', function(socket) {

  socket.on("Create Session", function(Data) {
      console.log(Data)
  		code = parseInt(Data.Code)
  		var Name = Data.Name;
      socket.join(code)
  		socket.username = Name;
      socket.rank = "Host";
      socket.room = code;
      socket.points = 0;
  		socket.emit('host recieve code', {
        listOfPlayers: getNames(),
  			Code: code
  		});
  	});
  //Change this so that this runs on the whiteboard.html
  socket.on("join session", function(data) {
      console.log(data.dataCode);
  		var code = parseInt(data.dataCode);
      if(Rooms.indexOf(code) != -1)
      {
      	socket.join(code)
      	socket.username = data.dataName;
        socket.rank = "User"
        socket.room = code
        socket.points = 0;
      	socket.emit('user recieve code', {
          listOfPlayers: getNames(),
      		Code: code
      	});//returns back to the caller
        socket.broadcast.to(code).emit("new player", {userName:data.dataName, code:code, rank:"User"});
      } else {
        console.log("bad code: " + code);
      	socket.emit('Bad Code', {
      		result:false
      	});
      }
  	});

  socket.on("generate code", function() {
    var roomCode = Math.floor(Math.random() * 100000);
    var unique = true;
    while(unique) {
      if(Rooms.indexOf(roomCode) == -1) {
        Rooms.push(roomCode);
        console.log(Rooms)
        socket.emit("code created",roomCode)
        unique = false;
      }else{
        roomCode = Math.floor(Math.random() * 100000);
      }
    }
  });

  // socket.on("get names", function(data) {
  //   console.log(data.dataCode)
  //   console.log(socket.username)
  //     var code = data.dataCode;
  //     var groupList = [];
  //
  //     var roster = io.of('/').in(code).clients;
  //     console.log(roster);
  //     roster.forEach(function(user) {
  //       groupList.push(user.username)
  //     });
  //     socket.emit("receive names", groupList);
  // });

  function getNames() {
    console.log(socket.username)
    io.of('/').in(code).clients(function(error,clients){
      var groupList = [];
      for(var i in clients) {
        if(socket.room == clients[i])
          groupList.push(clients[i].username)
      }
      console.log(groupList)
    });
  }

  socket.on("chat", function(msg) {
    io.in(socket.room).emit('chat', msg);
  });

  socket.on('disconnect', function(data) {
    console.log("Disconnect")
    console.log(data)
  });

});




http.listen(port, () => console.log('listening on port ' + port));
