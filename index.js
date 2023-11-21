const express = require('express');
var rooms = [];
var passes = [];
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
	socket.on("roomtest", room=> {
		socket.on("passtest", pass=> {
		for(var x = 0; x < rooms.length; x++){
			if(rooms[x] === room && passes[x] === pass){
				tries++;
			}
		}
			if(tries === 0){
				socket.emit("retry");
			}
			else{
				socket.join(room);
				tries = 0;
				socket.emit("start");
			}
	})
	})
	socket.on("roomnew", room=> {
		socket.on("passnew", pass=> {
		for(var x = 0; x < rooms.length; x++){
			if(rooms[x] === room){
				tries++;
			}
		}
			if(tries === 0){
				rooms.push(room);
				passes.push(pass);
				socket.join(room);
				tries = 0
					socket.emit("start");
			}
			else{
				socket.emit("tryagain");
				tries = 0;
			}
	})
	})
	socket.nickname = people;
	if(people> 1){
		(async ()=>{
			var sockets = await Array.from(socket.rooms)[1].fetchSockets();
			sockets.forEach(sock=> {
				sock.broadcast.to(Array.from(sock.rooms)[1]).emit("joined", people);
			})
		})();
	}
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('a user disconnected');
	  people--;
  })
	socket.on("video", v=> {
		socket.broadcast.to(Array.from(socket.rooms)[1]).emit("v", {video: v, number: socket.nickname});
	})
});
server.listen(3000, () => {
  console.log('listening on *:3000');
});
