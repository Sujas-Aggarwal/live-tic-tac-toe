const webSocket = new WebSocket("ws://localhost:8080");
const gameStartButton = document.getElementById("game-start-button");
const gameWindow = document.getElementById("game-window");
const playerNameInput = document.getElementById("player-name-input");
const cells = document.getElementsByClassName("small-box");
const dynamicTextMessages = document.getElementById("dynamic-text-messages");
let player;
const startGame = () => {
    console.log("Game Start Request Sent!");
    webSocket.onopen = () => {
        console.log("Connected to the server");
    };
    webSocket.send(
        JSON.stringify({ type: "start", name: playerNameInput.value })
    );
};
webSocket.onmessage = (msg) => {
    const message = JSON.parse(msg.data);
    console.log(message);
    if (message.type == "move") {
        if (message.player != player) {
            dynamicTextMessages.innerHTML = "Your Turn";
        } else {
            dynamicTextMessages.innerHTML = "Opponent's Turn";
        }
        drawMove(message.role, message.position);
    } else if (message.type === "start") {
        dynamicTextMessages.innerHTML = message.message;
    } else if (message.type === "game-connected") {
        player = message.player;
        dynamicTextMessages.innerHTML = message.message;
    } else if (message.type === "result") {
        gameWindow.style.display = "none";
        for (let i = 0; i < cells.length; i++) {
            cells[i].innerHTML = "";
        }
        dynamicTextMessages.innerHTML = message.message;
    }
};
const drawMove = (role, pos) => {
    console.log(role);
    console.log(pos);
    let cell = document.getElementById(`small-box-${pos}`);
    cell.innerHTML = role;
};
const startGameAction = () => {
    if (playerNameInput.value == "") {
        return;
    }
    gameWindow.style.display = "flex";
    startGame();
};
gameStartButton.onclick = startGameAction;
for (let i = 0; i < cells.length; i++) {
    cells[i].addEventListener("click", (e) => {
        if (e.target.innerHTML == "") {
            webSocket.send(JSON.stringify({ type: "move", position: i + 1 }));
        }
    });
}
