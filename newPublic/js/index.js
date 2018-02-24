var socket = io();

function joinSession() {
  var data = {
    dataCode: parseInt(document.getElementById("code").value)
  }
  socket.emit("validate code", data);

}

function createSession() {
  socket.emit("generate code");
}

// socket.on("user recieve code", function(data) {
//   document.cookie="name=" + document.getElementById("name").value;
//   document.cookie="code=" + data.Code;
//   location.href = "./whiteboard.html";
// });

socket.on("code created", function(data) {
  document.cookie="name=" + document.getElementById("hostName").value;
  document.cookie="code=" + data;
  document.cookie="rank=host";
  location.href = "./hostWhiteboard.html";
});

socket.on("valid code", function(data) {
  if(data.auth) {
    document.cookie="name=" + document.getElementById("name").value;
    document.cookie="code=" + data.code;
    document.cookie="rank=user";
    location.href = "./whiteboard.html";
  } else {
    console.log("Bad Code");
  }
});
