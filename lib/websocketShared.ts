export interface ServerToClientEvents {
  chatUpdated: (payload: next2serverChatUpdate) => void;
  usersUpdated: () => void;
}

export interface next2serverChatUpdate {
  chatId: number
}

export interface ClientToServerEvents {
  hello: (jwt: string) => void;
  next2serverChatUpdate: (recipientsUserIds: string[], payload: next2serverChatUpdate) => void;
  usersUpdated: () => void;
}

export interface InterServerEvents {}

export interface SocketData {}

export type WebsocketTokenPayload = {
  username?: string
  isServer: boolean
}


export const jwtSigningSecret = process.env.JWT_SIGNING_SECRET as string;
if (!jwtSigningSecret) {
  throw new Error("jwtSigningSecret not set")
}

