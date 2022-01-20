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
const { cryptoMap } = require('./utils/constants/crypto');
const clientSocket = clientIO.connect(`${process.env.SOCKET_HOST}:${process.env.SOCKET_PORT}`, {reconnect: true});

clientSocket.on('connect', function () {
  console.log('Connected to the indexer socket!');
  cryptoMap.forEach(ct => {
    clientSocket.on(ct, function(from, msg){
          console.log(` ${ct} received message ===> ${from}`)
          if(emitSocket){
            console.log(emitSocket)
          emitSocket.emit(ct, from, msg);}
      })
  })
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