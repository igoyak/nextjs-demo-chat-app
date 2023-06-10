import {withIronSessionApiRoute} from 'iron-session/next'
import {sessionOptions} from 'lib/session'
import {NextApiRequest, NextApiResponse} from 'next'
import prisma from "../../lib/prisma";
import {getChatId, getUsernamesInChat, userIdFromUsername} from "../../lib/prismaQueries";
import {next2serverChatUpdate} from "../../lib/websocketShared";
import {serverWebsocketClient} from "../../lib/websocketServerClient";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const msg: string = req.body.msg;
    const untrustedChatId: number = req.body.chatId;
    // @ts-ignore
    const username = req.session.user.login;
    const userId = await userIdFromUsername(username);
    const chatId = await getChatId(untrustedChatId, userId);
    if (!chatId) {
      return res.status(404).json({message: "chat not found"})
    }
    const usersInChat = await getUsernamesInChat(chatId);
    const now: number = Math.round(Date.now() / 1000);
    const newMsg = await prisma.message.create({
      data:
        {
          userId,
          chatId,
          content: msg,
          time: now,
        }
    });
    const payload: next2serverChatUpdate = {
      chatId: chatId,
    }
    const recipientsUserIds = usersInChat.filter(u => u !== username); // skip sending to current user
    serverWebsocketClient.emit('next2serverChatUpdate', recipientsUserIds, payload)
    serverWebsocketClient.emit('usersUpdated')
    res.json({})
  } catch (error) {
    console.log(error)
    res.status(500).json({message: (error as Error).message})
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)
