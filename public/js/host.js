function startGame() {
  socket.emit("start game", getCookie("code"));
  document.getElementById("sButton").className = "hidden"
}
