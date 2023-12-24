const express = require('express');
const app = express();
const http = require('http');
const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
    },
});

const PORT = process.env.PORT || 8080;

//어떤 방에 유저가 있는지
let users = {};
//socket.id 기준으로 어떤 방에 들어있는지
let socketRoom = {};

//방의 최대 인원수
const MAXIMUM = 2;

io.on("connection", (socket) => {
    console.log(socket.id, "connection");
    socket.on("join_room", (data) => {
        //기존에 방이 생성되어 있다면
        if (users[data.room]) {
            const currentRoomLength = users[data.room].length;
            if (currentRoomLength == MAXIMUM) {
                socket.to(socket.id).emit("room_full");
                return;
            }

            //자리가 있는 경우 => 기존 방 배열에 해당 유저를 추가
            users[data.room] = [...users[data.room], {id: socket.id}];
        }
        else {                                          //방이 존재하지 않는 경우
            users[data.room] = [{id: socket.id}];       //방 새로 만들고 유저 추가하기
        }

        socketRoom[socket.id] = data.room;
        //입장
        socketRoom.join(data.room);

        const others = users[data.room].filter((user) => user.id !== socket.id);
        if (others.length) {
            io.sockets.to(socket.id).emit("all_users", others);
        }
    });

    socket.on("offer", (sdp, roomName) => {
        socket.to(roomName).emit("getOffer", sdp);
    });

    socket.on("answer", (sdp, roomName) => {
        socket.to(roomName).emit("getAnswer", sdp);
    });
    
    socket.on("candidate", (candidate, roomName) => {
        socket.to(roomName).emit("getCandidate", candidate);
    });

    socket.on("disconnect", () => {
        const roomID = socketRoom[socket.id];

        if (users[roomID]) {
            users[roomID] = users[roomID].filter((user) => user.id !== socket.id);
            if (users[roomID].length === 0) {
                delete users[roomID];
                return;
            }
        }
        delete socketRoom[socket.id];
        socket.broadcast.to(users[roomID]).emit("user_exit", {id : socket.id});
    });
});

server.listen(PORT, () => {
    console.log(`sever running on ${PORT}`);
});