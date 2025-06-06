import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
// Note: Socket from socket.io-client is not needed for server-side code    
import { Socket } from 'socket.io-client';
import ACTIONS from './src/Actions.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);


const userSocketMap = {};

function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId)=>{
        return {
            socketId,
            username:userSocketMap[socketId], 
        }
    });
}



io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN,({roomId,username})=>{
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({socketId})=>{
            io.to(socketId).emit(ACTIONS.JOINED,{
                clients,
                username,
                socketId: socket.id,
            });

        })
    });

    socket.on(ACTIONS.CODE_CHANGE,({roomId, code1})=>{
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {
            code1,
        });
    })
    socket.on(ACTIONS.INPUT_CHANGE,({roomId,input})=>{
        
        socket.in(roomId).emit(ACTIONS.INPUT_CHANGE, {
            input,
        });
    })
    socket.on(ACTIONS.OUTPUT_CHANGE,({roomId, output})=>{
        socket.in(roomId).emit(ACTIONS.OUTPUT_CHANGE, {
            output,
        });
    })
    



    socket.on('disconnecting',()=>{
        const rooms =[...socket.rooms];
        rooms.forEach((roomId)=>{
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId : socket.id,
                username : userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });

});



//GEMINI API 












const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});