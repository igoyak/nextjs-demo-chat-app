import {io, Socket} from "socket.io-client";
import {ClientToServerEvents, ServerToClientEvents} from "./websocketShared";
import {hostname} from "./constants";

export const notificationSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(`${hostname}:3001`);
