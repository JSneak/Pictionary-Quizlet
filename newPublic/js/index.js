var socket = io();

var code;

function joinSession() {
  var data = {
    dataCode: document.getElementById("code").value
  }
  socket.emit("join session", data);

}

function createSession() {
  socket.emit("generate code");
}

socket.on("user recieve code", function(data) {
  document.cookie="name=" + document.getElementById("name").value;
  document.cookie="code=" + data.Code;
  location.href = "./whiteboard.html";
});

socket.on("code created", function(data) {
  document.cookie="name=" + document.getElementById("hostName").value;
  document.cookie="code=" + data;
  location.href = "./hostWhiteboard.html";
});
