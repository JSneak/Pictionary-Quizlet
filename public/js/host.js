function startGame() {
  socket.emit("start game", getCookie("code"));
}
