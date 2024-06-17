const express = require("express");
const app = express();
const http = require("http");
const webSocket = require("ws");
const server = http.createServer(app);
const wss = new webSocket.Server({ server });
let player1 = null;
let player2 = null;
let turn = 1;
let arr = ["", "", "", "", "", "", "", "", ""];
const checkArr = (arr) => {
    if (arr[0] === arr[1] && arr[1] === arr[2] && arr[0] !== "") {
        return true;
    }
    if (arr[3] === arr[4] && arr[4] === arr[5] && arr[3] !== "") {
        return true;
    }
    if (arr[6] === arr[7] && arr[7] === arr[8] && arr[6] !== "") {
        return true;
    }
    if (arr[0] === arr[3] && arr[3] === arr[6] && arr[0] !== "") {
        return true;
    }
    if (arr[1] === arr[4] && arr[4] === arr[7] && arr[1] !== "") {
        return true;
    }
    if (arr[2] === arr[5] && arr[5] === arr[8] && arr[2] !== "") {
        return true;
    }
    if (arr[0] === arr[4] && arr[4] === arr[8] && arr[0] !== "") {
        return true;
    }
    if (arr[2] === arr[4] && arr[4] === arr[6] && arr[2] !== "") {
        return true;
    }
    return false;
};
app.use(express.json());
wss.on("connection", (ws) => {
    ws.on("close", () => {
        if (player1 === ws) {
            player1 = null;
            if (player2 !== null) {
                player2.send(JSON.stringify({ message: "Player 1 left" }));
            }
        } else if (player2 === ws) {
            player2 = null;
            if (player1 !== null) {
                player1.send(JSON.stringify({ message: "Player 2 left" }));
            }
        }
    });
    ws.on("message", (message) => {
        console.log(JSON.parse(message));
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === "start") {
            if (player1 === null) {
                player1 = ws;
                player1.send(
                    JSON.stringify({
                        type: "game-connected",
                        player: 1,
                        message: "You are playing 'X'",
                    })
                );
            } else if (player2 === null && player1 !== ws) {
                player2 = ws;
                player2.send(
                    JSON.stringify({
                        type: "game-connected",
                        player: 2,
                        message: "You are player 'O'",
                    })
                );
                player2.send(
                    JSON.stringify({
                        type: "start",
                        message: "Game Started, Waiting for opponent's move",
                    })
                );
                player1.send(
                    JSON.stringify({
                        type: "start",
                        message: "Player Connected, It's your turn",
                    })
                );
            } else {
                ws.send(JSON.stringify({ message: "Lobby Full" }));
            }
        } else if (parsedMessage.type === "move") {
            if (player1 === null || player2 === null) {
                ws.send(
                    JSON.stringify({ message: "Waiting for other player" })
                );
                return;
            }
            if (ws === player1 || ws === player2) {
                const player = ws === player1 ? 1 : 2;
                if (player === 1 && turn === 1) {
                    arr[parsedMessage.position - 1] = "X";
                    turn = 2;
                    player2.send(
                        JSON.stringify({
                            type: "move",
                            role: "X",
                            player: 1,
                            position: parsedMessage.position,
                        })
                    );
                    player1.send(
                        JSON.stringify({
                            type: "move",
                            role: "X",
                            player: 1,
                            position: parsedMessage.position,
                        })
                    );
                } else if (player === 2 && turn === 2) {
                    arr[parsedMessage.position - 1] = "O";
                    turn = 1;
                    player1.send(
                        JSON.stringify({
                            type: "move",
                            role: "O",
                            player: 2,
                            position: parsedMessage.position,
                        })
                    );
                    player2.send(
                        JSON.stringify({
                            type: "move",
                            role: "O",
                            player: 2,
                            position: parsedMessage.position,
                        })
                    );
                }
                let result = checkArr(arr);
                if (result) {
                    if (turn === 1) {
                        player2.send(
                            JSON.stringify({
                                type: "result",
                                message: "You Win",
                            })
                        );
                        player1.send(
                            JSON.stringify({
                                type: "result",
                                message: "You Lose",
                            })
                        );
                    } else {
                        player1.send(
                            JSON.stringify({
                                type: "result",
                                message: "You Win",
                            })
                        );
                        player2.send(
                            JSON.stringify({
                                type: "result",
                                message: "You Lose",
                            })
                        );
                    }
                    player1 = null;
                    player2 = null;
                    turn = 1;
                    arr = ["", "", "", "", "", "", "", "", ""];
                }
            }
        }
    });
});

server.listen(8080, () => {
    console.log("Server started on http://localhost:8080");
});
