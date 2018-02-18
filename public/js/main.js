
socket.on("start game", function(data) {
  if (data == getCookie("name")) {
    initWhiteBoard()
  }else{
    context = undefined;
  }
});
