
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
