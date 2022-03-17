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
let emitSocket;
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


  const topTokens = await RedisUtilClass.getKeys(`toptoken_*`)
    if (topTokens.data) {
      for (let data of topTokens.data) {
        const tokenSymbol = await RedisUtilClass.getValue(data)
        const tS = tokenSymbol.data.replace(/"/g, ''); 
        if (tS && !socketCreated[tS]) {
          socketCreated[tS] = true
          clientSocket.on(tS, function (from, msg) {
            if (emitSocket) {
              emitSocket.emit(tS, from, msg);
            }
          })
        }
                
        }
    }
  if(!socketCreated[allCryptoSocket]){
    socketCreated[allCryptoSocket] = true
    clientSocket.on(allCryptoSocket, function (from, msg) {
      if (emitSocket) {
        emitSocket.emit(allCryptoSocket,from, msg );
      }
    })  
  }
});

io.on('connection', (socket) => {
  console.log("received the connection")
  emitSocket = socket
});

sslServer.listen( sslPort, function() {
  console.log(  `Listening HTTPS on ${sslPort}` );
});

io.attach(sslServer)
