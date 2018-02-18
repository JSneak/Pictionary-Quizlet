'use strict';
var socket = io();
var currentWord;

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

var code = getCookie("code");

var drawing = false;
var canvas = document.getElementsByClassName('whiteboard')[0];
var colors = document.getElementsByClassName('color');
var context = canvas.getContext('2d');
var current = {
  color: 'black'
};

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
socket.emit("join session", data);

socket.emit("get names", {dataCode: code});

socket.on("message", function(data) {
  initWhiteBoard();
  context = canvas.getContext('2d');
  if (data.name == getCookie("name")) {
    currentWord = data.word;
    document.getElementById("msg").innerHTML = data.word;
  } else {
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

socket.on("new name", function(data) {
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

function initWhiteBoard() {

  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

  for (var i = 0; i < colors.length; i++){
    colors[i].addEventListener('click', onColorUpdate, false);
  }

  socket.on('drawing', onDrawingEvent);

  window.addEventListener('resize', onResize, false);
  onResize();
}


  function drawLine(x0, y0, x1, y1, color, emit){
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();
    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('drawing', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color
    });
  }

  var offset = 500;

  function onMouseDown(e){
    drawing = true;
    current.x = e.clientX - offset;
    current.y = e.clientY;
  }

  function onMouseUp(e){
    if (!drawing) { return; }
    drawing = false;
    drawLine(current.x, current.y, e.clientX - offset, e.clientY, current.color, true);
  }

  function onMouseMove(e){
    if (!drawing) { return; }
    drawLine(current.x, current.y, e.clientX - offset, e.clientY, current.color, true);
    current.x = e.clientX - offset;
    current.y = e.clientY;
  }

  function onColorUpdate(e){
    current.color = e.target.className.split(' ')[1];
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data){
    console.log("Gets Here")
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

  // make the canvas fill its parent
  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
