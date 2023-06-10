// https://socket.io/docs/v4/typescript/
import 'dotenv/config'
import {Server, Socket} from "socket.io";
import {
  ClientToServerEvents,
  InterServerEvents,
  jwtSigningSecret,
  ServerToClientEvents,
  SocketData, WebsocketTokenPayload
} from "../lib/websocketShared";
import {hostname} from "../lib/constants";
import jwt from "jsonwebtoken";

const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);

const io = new Server<ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData>(server, {
  cors: {
    origin: `${hostname}:3000`,
  }
});

interface State {
  sockets: {
    time: number,
    username: string,
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  }[];
}

const state: State = {
  sockets: []
}


io.on("connection", (socket) => {
  socket.on('disconnect', () => {
    console.log('disconnected');
  });
  socket.on('hello', (token) => {
    console.log('hello', token);
    if (!token) {
      return
    }
    let decoded: WebsocketTokenPayload;
    try {
      decoded = jwt.verify(token, jwtSigningSecret, {algorithms: ['HS256']}) as WebsocketTokenPayload
      console.log('browserHello decoded', decoded);
    } catch (ex) {
      console.log(ex);
      return;
    }
    const isServer = decoded.isServer
    if (isServer) {
      console.log('server hello')
      handleServer(socket);
    } else {
      const username = decoded.username as string;
      console.log('user hello', username)
      handleUserSocket(username, socket);
    }
  });
});

function handleUserSocket(username: string, socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
  const existingSockets = state.sockets
    .filter(s => s.username == username)
    .map(s => [s.time, s])
  if (existingSockets.length > 1) {
    console.log(`too many sockets for ${username}, removing`)
    state.sockets = state.sockets
      .filter(s => s.username !== username);
  }

  state.sockets.push({
    username: username,
    time: Math.round(Date.now() / 1000),
    socket,
  })
  socket.on('disconnect', () => {
    console.log('user disconnected');
    state.sockets = state.sockets.filter(s => s.socket !== socket);
  });
}

function handleServer(socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
  socket.on('next2serverChatUpdate',
    (recipientsUserIds, payload) => {
      console.log('got next2serverChatUpdate')
      console.log(state)
      for (const recipient of recipientsUserIds) {
        const sockets = state.sockets.filter(s => s.username === recipient)
        for (const s of sockets) {
          debounce(`chatUpdated_${JSON.stringify(payload)}`, () => {
            console.log('sending chatUpdated to ', recipient)
            s.socket.emit('chatUpdated', payload)
          })
        }
      }
    })
  socket.on('usersUpdated', () => {
    debounce('usersUpdated', () => {
      console.log('sending usersUpdated')
      io.emit('usersUpdated')
    })
  });
}


let debounceState: string[] = []

function debounce(key: string, func: Function) {
  const timeoutMs = 50;
  if (debounceState.includes(key)) {
    console.log('skipping, debounce', key)
    return
  }
  debounceState.push(key)
  setTimeout(() => {
    func();
    debounceState = debounceState.filter(s => s !== key)
  }, timeoutMs)
}

server.listen(3001, () => {
  console.log('listening on *:3001');
});

