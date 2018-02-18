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
  		code = genRand();
  		var Name = Data.hostName;
  		socket.username = Name;
  		socket.room = code;
  		usernames.push({userName: Name, code:code, rank:"Host", sessionState: false});
  		socket.join(code);
  		socket.emit('recieve code', {
  			Code: code
  		});
  	});

  socket.on("join session", function(data) {//Checks the code
  		var GivenName = data.dataName;
  		var GivenCode = data.dataCode;
  		var groupList;
      if(Rooms.indexOf(data.dataCode) != -1)
      {
      	socket.room = data.dataCode;
      	socket.username = data.dataName;
      	usernames.push({userName:data.dataName, code:data.dataCode, rank:"User"})
      	socket.join(data.dataCode);
      	if((usernames.map(function(e) { return e.code; }).indexOf(data.dataCode);) != -1)
      	{
      		groupList = usernames[usernames.map(function(e) { return e.code; }).indexOf(data.dataCode)]["userName"];
      	}
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
  	for(i=0;i<usernames.length;i++)
  	{
  		if(usernames[i]['userName'] == socket.username)
  		{
  			if(usernames[i]['rank'] == 'User')
  			{
  				NumberOfGuests--;
  			}else if(usernames[i]['rank'] == 'Host')
  			{
  				for(j=0;j<Rooms.length;j++)
  				{
  					if(Rooms[j] == usernames[i]['code'])
  					{
  					io.sockets.emit('end of session',{
  						Code:usernames[i]['code']
  					})
  					Rooms.splice(j,1);
  					NumberOfGuests--;
  					}
  				}
  			}
  			usernames.splice(i,1);
  		}
  	}
  	socket.leave(socket.room);
  	});
});

function genRand() {
	roomCode = Math.floor(Math.random() * 100000);
  while(unique) {
    if(Rooms.indexOf(roomCode) == -1) {
      Rooms.push(roomCode);
      return roomCode;
    }
  }
}

http.listen(port, () => console.log('listening on port ' + port));
