var socket = io();

var code;

function joinSession() {
  document.cookie="name=" + document.getElementById("name").value;
  document.cookie="code=" + document.getElementById("code").value;
  location.href = "./whiteboard.html";
}

function createSession() {

  var data = {
    hostName: document.getElementById("hostName").value
  }
  socket.emit("Create Session", data);

  document.cookie="name=" + document.getElementById("hostName").value;
}

socket.on("user recieve code", function(data) {
  code = data.Code;
  document.cookie="code=" + code;
  location.href = "./hostWhiteboard.html";
});
