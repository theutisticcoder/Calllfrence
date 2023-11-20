const express = require('express');

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var people = 0;
var tries = 0;
app.use(express.static(__dirname+"/public"))

io.on('connection', (socket) => {
	people++;
	
	socket.nickname = people;
	if(people> 1){
		(async ()=>{
			var sockets = await io.fetchSockets();
			sockets.forEach(sock=> {
				sock.broadcast.emit("joined", people);
			})
		})();
	}
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('a user disconnected');
	  people--;
  })
	socket.on("video", v=> {
		socket.broadcast.emit("v", {video: v, number: socket.nickname});
	})
});
server.listen(3000, () => {
  console.log('listening on *:3000');
});
