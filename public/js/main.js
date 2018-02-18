var socket = io();

socket.on("recieve code", function(data) {
  console.log(data)
});

socket.emit("get code");
