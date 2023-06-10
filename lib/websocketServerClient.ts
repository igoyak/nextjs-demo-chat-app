import {notificationSocket} from "./websocketsBrowserClient";
import jwt from "jsonwebtoken";
import {jwtSigningSecret, WebsocketTokenPayload} from "./websocketShared";

const websocketsTokenPayload: WebsocketTokenPayload = {
  isServer: true,
}

const websocketsToken = jwt.sign(websocketsTokenPayload, jwtSigningSecret, {algorithm: 'HS256'})
notificationSocket.emit('hello', websocketsToken)

export const serverWebsocketClient = notificationSocket


