const express = require('express')
const app = express();
require('dotenv').config();
const https = require("https");
const fs = require('fs')
const options = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH),
  requestCert: false,
  rejectUnauthorized: process.env.REJECT_UNAUTHORIZED_CERT === 'true'
}

const sslServer = https.createServer(options, app);


const { Server } = require("socket.io");
const io = new Server();
const sslPort = process.env.SOCKET_SERVER_SSL_PORT
let emitSocket;
const clientIO = require('socket.io-client');
const RedisUtilClass = require('./utils/redisUtils');
const clientSocket = clientIO.connect(`${process.env.SOCKET_HOST}:${process.env.SOCKET_PORT}`, { reconnect: true,  "rejectUnauthorized": false });
clientSocket.on('connect', async function () {
  console.log('Connected to the indexer socket! ');

  let channelsCreated = false

  const topTokens = await RedisUtilClass.getKeys(`toptoken_*`)
  while(!channelsCreated){
    if (topTokens.data) {
  
      for (let data of topTokens.data) {
        const tokenSymbol = await RedisUtilClass.getValue(data)
        const tS = tokenSymbol.data
        if (tS) {
          clientSocket.on(tS, function (from, msg) {
            console.log(` ${tS} received message from ${from} as  ===> ${msg}`)
            if (emitSocket) {
              emitSocket.emit(tS, from, msg);
            }
          })
          clientSocket.on('AllCrypto', function (from, msg) {
            console.log(` ${from} received message ===> ${msg}`)
            if (emitSocket) {
              emitSocket.emit('AllCrypto',from, msg );
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

sslServer.listen( sslPort, function() {
  console.log(  `Listening HTTPS on ${sslPort}` );
});

io.attach(sslServer)