import type {User} from './user'

import {withIronSessionApiRoute} from 'iron-session/next'
import {sessionOptions} from 'lib/session'
import {NextApiRequest, NextApiResponse} from 'next'
import {v4 as uuidv4} from 'uuid';
import prisma from "../../lib/prisma";
import {getChatId, userIdFromUsername} from "../../lib/prismaQueries";

export type ChatInfo = {
  username: string,
  chatId: number | null,
}

export type ChatMessage = {
  username: string,
  userId: number,
  chatId: number,
  content: string,
  time: number,
}

async function handler(req: NextApiRequest, res: NextApiResponse) {

  try {
    // @ts-ignore
    const username = req.session.user.login;
    const untrustedChatId = Number(req.query.chatId);
    const userId = await userIdFromUsername(username);
    const chatId = await getChatId(untrustedChatId, userId);


    const messages: ChatMessage[] = await prisma.$queryRaw<ChatMessage[]>`
        select username, userId, chatId, content, time from message
            left join user on user.id = message.userId
            where chatId = ${chatId} order by time asc
        `
    res.json(messages)
  } catch (error) {
    console.log(error)
    res.status(500).json({message: (error as Error).message})
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)
