
function startGame() {
  var deck = []
  if((document.getElementById("uniqueDeck").value) != "") {
    deck = (document.getElementById("uniqueDeck").value).split(',');
  }
  var data = {
    wordDeck: deck,
    code: getCookie("code")
  }
  socket.emit("start game", data);
  document.getElementById("sButton").className = "hidden"
}

socket.emit("Create Session", {Code: getCookie("code"), Name: getCookie("name")});
