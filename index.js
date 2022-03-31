const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config();
const https = require("https");
const fs = require('fs')
const options = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH),
  requestCert: false,
  rejectUnauthorized: process.env.REJECT_UNAUTHORIZED_CERT === 'true'
}



const { Server } = require("socket.io");
const sslPort = process.env.SOCKET_SERVER_SSL_PORT
const allCryptoSocket = process.env.ALL_CRYPTO_SOCKET
let emitSockets = [];
const clientIO = require('socket.io-client');
const RedisUtilClass = require('./utils/redisUtils');
const clientSocket = clientIO.connect(`${process.env.SOCKET_HOST}:${process.env.SOCKET_PORT}`, { reconnect: true,  "rejectUnauthorized": false });
app.use(cors())

const sslServer = https.createServer(options, app);

const io = new Server({
  cors: {
    origin: '*',
  }
});

const socketCreated = {}

clientSocket.on('connect', async function () {
  console.log('Connected to the indexer socket! ');

    clientSocket.on(allCryptoSocket, function (from, msg) {
      const temp = JSON.parse(msg)

      if (emitSockets.length) {
        emitSockets.forEach(emitSocket => {
          emitSocket.emit(allCryptoSocket,from, msg );
        })
      }
    })  
  
  clientSocket.on("disconnect", (reason) => {
    console.log(reason); // "ping timeout"
  });
});


io.on('connection', (socket) => {
  console.log("Received the new connection")
  emitSockets.push(socket)
});

sslServer.listen( sslPort, function() {
  console.log(`Listening HTTPS on ${sslPort}` );
});

io.attach(sslServer)
