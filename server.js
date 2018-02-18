const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
app.use(express.static(__dirname + '/public'));


var Rooms = [];
var usernames = [];//{}for json data, but we use [] because of the way we store the data
var currentRoomPlayers = {};
var currentWords = {};
var words = ["asdfkasdf", "sd"];


io.on('connection', function(socket) {
  function onConnection(socket){
    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
  }

  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));

  socket.on("chat", function(msg) {
    io.sockets.to(socket.room).emit("chat", msg);
  })

  socket.on("Create Session", function(Data) {
      console.log(Data)
  		code = genRand();
  		var Name = Data.hostName;
  		socket.username = Name;
  		socket.room = code;
      socket.rank = "Host";
      socket.points = 0;
  		socket.join(code);
  		socket.emit('user recieve code', {
  			Code: code
  		});
  	});

    socket.on("get names", function(data) {
      var code = parseInt(data.dataCode);
      groupList = getUsers(code);
      socket.emit("receive names", groupList);
    })

  socket.on("join session", function(data) {//Checks the code
  		var GivenName = data.dataName;
  		var GivenCode = parseInt(data.dataCode);
  		var groupList;
      if(Rooms.indexOf(GivenCode) != -1)
      {
      	socket.room = GivenCode;
      	socket.username = data.dataName;
        socket.rank = "User"
        socket.points = 0;
      	usernames.push({userName:data.dataName, code:GivenCode, rank:"User"})
      	socket.join(GivenCode);
      	socket.emit('user recieve code', {
      		Code: GivenCode
      	});//returns back to the caller
        socket.broadcast.to(GivenCode).emit("new name", {userName:data.dataName, code:GivenCode, rank:"User"});
      } else {
        console.log("bad code: " + GivenCode);
      	socket.emit('Bad Code', {
      		result:false
      	});
      }

  	});

  socket.on("get code", function() {
    socket.emit("recieve code", socket.room);
  });

  socket.on('disconnect', function(data) {
    console.log("Disconnect")
    console.log(data)
    if((usernames.map(function(e) { return e.userName; }).indexOf(socket.username)) != -1)
    {
      if((usernames.map(function(e) { return e.rank; }).indexOf("Host")) != -1)
      {
        io.sockets.emit('end of session',{
          Code:socket.room
        })
        Rooms.splice((usernames.map(function(e) { return e.rank; }).indexOf(socket.rank)),1);
      }
      usernames.splice((usernames.map(function(e) { return e.userName; }).indexOf(socket.username)),1);
    }
    socket.leave(socket.room);
  });

  socket.on("start game", function(data) {
    var chosenUser = choosePlayer(data);
    io.sockets.to(data).emit("start game", {player: chosenUser.userName});
  });

  socket.on("update points", function(data) {
      socket.points += 10;
      io.sockets.to(socket.room).emit("update points", {player: socket.username, points:socket.points});
  });

  function getUsers(code) {
    var matching = [];
    for (var i = 0; i < usernames.length; i++) {
      if (parseInt(usernames[i].code) == parseInt(code)) {
        matching.push(usernames[i]);
      }
    }
    return matching;
  }

  function getUserByName(code, name) {
    var users = getUsers(code);
    for (var i = 0; i < users.length; i++) {
      if (users[i].userName == name) {
        return users[i];
      }
    }
  }

  function getSocketByUsername(code, name) {
    for (var i = 0; i < io.sockets.clients(code).length; i++) {
      if (io.sockets.clients(code)[i].username == name) {
        return io.sockets.clients(code)[i];
      }
    }
  }

  function choosePlayer(code) {
    currentRoomPlayers[code]++;
    if (currentRoomPlayers[code] >= io.of('/' + code).sockets.length) {
      currentRoomPlayers[code] = 0;
    }
    console.log(io.of('/' + code).sockets);
    var user = getUsers(code)[currentRoomPlayers[code]];
    turnTimer(code);
    var word = words[Math.floor(Math.random()*words.length)];
    currentWords[code] = word;
    io.sockets.to(code).emit("message", {"name": user.userName, "word": word});
    return user;
  };

  function transitionTimer(code) {
    setTimeout(choosePlayer.bind(null, code), 5*1000);
  }

  function turnTimer(code) {
    setTimeout(transitionTimer.bind(null, code), 10*1000);
    io.sockets.to(code).emit("countdown", 10);
  }

});

function genRand() {
	roomCode = Math.floor(Math.random() * 100000);
  var unique = true;
  while(unique) {
    if(Rooms.indexOf(roomCode) == -1) {
      Rooms.push(roomCode);
      currentRoomPlayers[roomCode] = 0;
      currentWords[roomCode] = "";
      console.log(Rooms);
      return roomCode;
    }
  }
}

http.listen(port, () => console.log('listening on port ' + port));
