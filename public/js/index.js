var socket = io();

function joinSession() {
  var data = {
    dataName: document.getElementById("name").value,
    dataCode: document.getElementById("code").value
  }
  socket.emit("join session", data)
}

function createSession() {
  var data = {
    hostName: document.getElementById("hostName").value
  }
  socket.emit("Create Session", data);
}

socket.on("user recieve code", function(data) {
  location.href = "whiteboard.html"
});
