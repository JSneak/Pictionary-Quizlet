const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
app.use(express.static(__dirname + '/newPublic'));

var Rooms = []; //List of all rooms with codes.


//Keep track of all Players
//Keys will be Room code
//Value with be player data
// var player = {points: 0, username: "Tim"}
// Players = { '512': [{points: 0, username: "Tim"},{points: 1, username: "Ben"}]}

var Players = {};


io.on('connection', function(socket) {

  //Called in index.html
  socket.on("generate code", function() {
    var roomCode = Math.floor(Math.random() * 100000);
    var unique = true;
    while(unique) {
      if(Rooms.indexOf(roomCode) == -1) {
        Rooms.push(roomCode);
        socket.emit("code created",roomCode)
        unique = false;
      }else{
        roomCode = Math.floor(Math.random() * 100000);
      }
    }
  });


  socket.on("Create Session", function(Data) {
  		code = parseInt(Data.Code);
      console.log("Create Session: " + code)
  		var Name = Data.Name;
      socket.join(code)
  		socket.username = Name;
      socket.rank = "Host";
      socket.room = code;
      socket.points = 0;

      var data = {
        username: Name,
        rank: "Host",
        points: 0
      }
      var test = [data]
      Players[code] = test
  	});

    socket.on("validate code", function(data) {
      if(Rooms.indexOf(data.dataCode) != -1)
      {
        var returnData = {
          auth: true,
          code: data.dataCode
        }
        socket.emit("valid code", returnData);
      }else{
        var returnData = {
          auth: false,
          code: data.dataCode
        }
        socket.emit("valid code", returnData)
      }
    });

    //called in main.js
    socket.on("join session", function(data) {
      var code = parseInt(data.dataCode);
      var name = data.dataName
      //console.log("Join Session: " + code);
      if(Rooms.indexOf(code) != -1)
      {
        socket.join(code)
        socket.username = name;
        socket.rank = "User"
        socket.room = code
        socket.points = 0;
        var data = {
          username: name,
          rank: "User",
          points: 0
        }
        var vals = Object.keys(Players).map(function(code) {
            return Players[code];
        });
        socket.emit('join success', {
          listOfPlayers: vals,
          Code: code
        });//returns back to the caller
        vals.push(data);
        Players[code] = vals;
        console.log(Players[code])
        socket.broadcast.to(code).emit("new player", {code:code, userName:name});
      } else {
        console.log("bad code: " + code);
        socket.emit('Bad Code', {
          result:false
        });
      }
    });

  function getNames(code) {
    io.of('/').in(code).clients(function(error,clients){
      var groupList = [];
      for(var i in clients) {
        console.log(clients)
        if(socket.room == clients[i])
          groupList.push(clients[i].username)
      }
      console.log(groupList)
      return groupList;
    });
  }

  socket.on("chat", function(msg) {
    io.in(socket.room).emit('chat', msg);
  });

  socket.on('disconnect', function(data) {
    console.log("Disconnect")
  });

});




http.listen(port, () => console.log('listening on port ' + port));
