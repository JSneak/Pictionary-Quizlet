var socket = io();

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


socket.on("start game", function(data) {
  console.log("hi")
  if (data.player == getCookie("name")) {
    initWhiteBoard();
    console.log("hello")
  }else{
    context = undefined;
  }
});

socket.on("update points", function(data) {
  var names = document.getElementsByClassName("names")[0].childNodes;

  for (var i = 0; i < names.length; i++) {
    var text = names[i].innerHTML;
    if (text.split(" - ")[0] == data.player) {
      names[i].innerHTML = data.player + " - " + data.points;
      return;
    }
  }
});

function checkCorrectWord() {
  console.log(currentWord)
  if(document.getElementById("msg-input").value == currentWord)
  {
    socket.emit("chat", "<b>" + getCookie("name") + ": </b> got the question right!");
    socket.emit("update points", true);
  }
}

var currentWord;

var code = getCookie("code");

document.getElementById("code").innerHTML = "Code: " + getCookie("code");

function send() {
  checkCorrectWord()
  socket.emit("chat", "<b>" + getCookie("name") + ": </b>" + document.getElementById("msg-input").value);
  document.getElementById("msg-input").value = "";
}

// join
var data = {
  dataName: getCookie("name"),
  dataCode: code
}

socket.emit("get names", {dataCode: code});

var drawingAllowed = false;
socket.on("message", function(data) {
  initWhiteBoard();
  currentWord = data.word;
  context = canvas.getContext('2d');
  if (data.name == getCookie("name")) {
    document.getElementById("msg").innerHTML = data.word;
    drawingAllowed = true;
  } else {
    drawingAllowed = false;
  }
});

socket.on("chat", function(msg) {
  document.getElementById("chat-box").innerHTML += "<p>" + msg + "</p>"
});

socket.on("receive names", function(data) {
  for (var i = 0; i < data.length; i++) {
    var name = data[i].userName;
    document.getElementsByClassName("names")[0].innerHTML += "<p>" + name + " - 0</p>";
  }
});

socket.on("new player", function(data) {
  var name = data.userName;
  document.getElementsByClassName("names")[0].innerHTML += "<p>" + name + " - 0</p>";
});

socket.on("countdown", function(data) {
  document.getElementById("countdown").innerHTML = data;
});



setInterval(function() {
  if (parseInt(document.getElementById("countdown").innerHTML) > 0)
    document.getElementById("countdown").innerHTML = parseInt(document.getElementById("countdown").innerHTML) - 1;
  else{
    if(document.getElementById("msg").innerHTML != "") {
      document.getElementById("msg").innerHTML = "";
    }
  }
}, 1000);
