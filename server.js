const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
app.use(express.static(__dirname + '/public'));


var Rooms = [];
var usernames = [];//{}for json data, but we use [] because of the way we store the data


io.on('connection', function(socket) {
  function onConnection(socket){
    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
  }

  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));

  socket.on("Create Session", function(Data) {
      console.log(Data)
  		code = genRand();
  		var Name = Data.hostName;
  		socket.username = Name;
  		socket.room = code;
      socket.rank = "Host";
  		usernames.push({userName: Name, code:code, rank:"Host", sessionState: false});
  		socket.join(code);
  		socket.emit('recieve code', {
  			Code: code
  		});
  	});

  socket.on("join session", function(data) {//Checks the code
    
  		var GivenName = data.dataName;
  		var GivenCode = parseInt(data.dataCode);
  		var groupList;
      if(Rooms.indexOf(GivenCode) != -1)
      {
      	socket.room = GivenCode;
      	socket.username = data.dataName;
        socket.rank = "User"
      	usernames.push({userName:data.dataName, code:GivenCode, rank:"User"})
      	socket.join(GivenCode);
      	if((usernames.map(function(e) { return e.code; }).indexOf(GivenCode)) != -1)
      	{
      		groupList = usernames[usernames.map(function(e) { return e.code; }).indexOf(GivenCode)]["userName"];
      	}
        console.log("asd")
      	socket.emit('user recieve code', {
      		Code: GivenCode
      	});//returns back to the caller
      	io.sockets.emit('displayName', {
      		Code:GivenCode,
      		List:groupList
      	});//returns to everyone

      } else {
      	socket.emit('Bad Code', {
      		result:false
      	});
      }

  	});

  socket.on("get code", function() {
    socket.emit("recieve code", socket.room);
  });

  socket.on("Start Session", function(data) {
  	io.sockets.emit('start session', {
  					Code:data.code


  	});
  	for(var i=0;i<usernames.length;i++)
  	{
  		if(usernames[i]['rank'] == "Host")
  		{
  			if(usernames[i]['code'] == data.code)
  			{
  				usernames[i]['sessionState'] = true;
  			}
  		}
  	}
  });

  socket.on("buzz event", function(Data) {

  	io.sockets.emit('restrict', {
  		Code:Data.userCode
  	});
  	io.sockets.emit('someone buzzed', {
  		Code:Data.userCode,
  		PlayerName:Data.userName,
  		PlayerTeam:Data.userTeam
  	});
  });

  socket.on("Correct Reset", function(Data) {
  	io.sockets.emit('unrestrict', {
  		Code:Data.code
  	});
  });

  socket.on("Wrong Reset", function(Data) {
  	io.sockets.emit('unrestrict', {
  		Code:Data.code
  	});
  });

  socket.on("End Session", function(Data) {
  	io.sockets.emit('end of session', {
  		Code:Data.code
  	});
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

});

function genRand() {
	roomCode = Math.floor(Math.random() * 100000);
  var unique = true;
  while(unique) {
    if(Rooms.indexOf(roomCode) == -1) {
      Rooms.push(roomCode);
      console.log(Rooms);
      return roomCode;
    }
  }
}

http.listen(port, () => console.log('listening on port ' + port));
