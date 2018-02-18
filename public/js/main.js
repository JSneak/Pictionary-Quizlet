
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
  console.log(data);
});

function checkCorrectWord() {
  if(document.getElementById("msg-input").value == currentWord)
  {
    socket.emit("update points", true);
  }
}
