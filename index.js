const express = require('express')
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 3001

app.get('/', (req, res) => {
  res.send('Hello World!')
})

io.on('connection', (socket) => {
    console.log('a user connected');
    // socket.emit('CH01', 'me', 'test msg');
    socket.on('CH01', function(from, msg){
        console.log(` received message ===> ${msg}`)
        socket.emit('CH01', 'index.js', 'reply msg');
    })
});

server.listen(port, () => {
    console.log(`listening on *:${port}`);
});