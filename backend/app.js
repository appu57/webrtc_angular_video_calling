const express = require('express');
const app = express();
const http = require('http');

const body_parser = require('body-parser');
app.use(body_parser.json());
app.use(body_parser.urlencoded({extended:true}));

app.set('view engine','ejs');
app.set('views','./views');

app.use(express.static('public'));

const cors = require("cors");
app.use(cors());


const userroutes = require('./routes/userroutes');
app.use('/user',userroutes);

const server = http.Server(app);
server.listen("3000",function(){
    console.log("Server is running on port 3000");
})

const socketio = require('socket.io')(server);
socketio.on('connection',function(socket){ //socket or io on connection returns a callback function which has socket as an argument using which we can emit/listen
    console.log("Server connected to Socket IO");

    socket.on("join", function(newroom){
    console.log(socket.id);
      var roomName = socketio.sockets.adapter.rooms;//fetch all rooms
      const roomExists = roomName.get(newroom);
      if(roomExists == undefined)
      {
          socket.join(newroom);
          socket.emit("roomCreated");
          console.log("A new room created");
      }
      else if(roomExists.size==1){ //only 2 people can connect with one another
          socket.join(newroom);
          socket.emit("roomJoined");
          console.log("Joined the existing room" , newroom);
      }
      else{         
          socket.emit("roomFull");
          console.log("Room is full");
      }
    });

    socket.on("ready",function(roomName){
        console.log("Ready event is considered" , roomName);
        var rooms = socketio.sockets.adapter.rooms;//fetch all rooms
        const roomExists = rooms.get(roomName);
        console.log(roomExists);
        socket.emit("PeerReady");
    });

    socket.on("candidate",function(candidate,roomName){
        console.log("Candidate",candidate);
        socket.broadcast.emit("candidate",candidate);

    });
    
    socket.on("offer",function(offer,roomName){
        console.log("offer",socket.id);
        socket.broadcast.emit("PeerOffer",{offer:offer,roomName:roomName}); //request to answer / decline the call

    });

    socket.on("answer",function(answer,roomName){
        console.log("answer",answer);
        socket.broadcast.emit("answer",answer); //response

    });

    socket.emit("leave" , function(roomName){
        socket.leave(roomName);
        socket.broadcast.emit("Peer disconnected");
    })
});