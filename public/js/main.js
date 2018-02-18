
socket.on("start game", function(data) {
  console.log("hi")
  if (data.player == getCookie("name")) {
    initWhiteBoard();
    console.log("hello")
  }else{
    context = undefined;
  }
});

function checkCorrectWord() {
  if(document.getElementById("msg").value == currentWord)
  {
    //Get Static Amount of Points
  }
}
