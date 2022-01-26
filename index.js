const express = require('express')
const app = express();
require('dotenv').config();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.SOCKET_SERVER_PORT
let emitSocket;
const clientIO = require('socket.io-client');
const RedisUtilClass = require('./utils/redisUtils');
const clientSocket = clientIO.connect(`${process.env.SOCKET_HOST}:${process.env.SOCKET_PORT}`, { reconnect: true });

clientSocket.on('connect', async function () {
  console.log('Connected to the indexer socket!');

  let channelsCreated = false

  const topTokens = await RedisUtilClass.getKeys(`toptoken_*`)
  while(!channelsCreated){
    if (topTokens.data) {
  
      for (let data of topTokens.data) {
        const tokenSymbol = await RedisUtilClass.getValue(data)
        const tS = tokenSymbol.data
        if (tS) {
          clientSocket.on(tS, function (from, msg) {
            console.log(` ${tS} received message ===> ${from}`)
            if (emitSocket) {
              emitSocket.emit(tS, from, msg);
            }
          })
        }
      }
      channelsCreated = true
    }
  }
});
app.get('/', (req, res) => {
  res.send('Hello World!')
})

io.on('connection', (socket) => {
  emitSocket = socket
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});