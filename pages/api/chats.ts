import {withIronSessionApiRoute} from 'iron-session/next'
import {sessionOptions} from 'lib/session'
import {NextApiRequest, NextApiResponse} from 'next'
import prisma from "../../lib/prisma";
import {getChatsForUser, getLastMessageInChat} from "../../lib/prismaQueries";

export type ChatInfo = {
  username: string,
  active: boolean,
  chatId: number | null,
  lastMessage: null | {
    content: string,
    time: number,
    username: string,
    userId: number,
  }
}


async function chats(req: NextApiRequest, res: NextApiResponse) {

  try {
    // @ts-ignore
    const username = req.session.user.login;
    const u = await prisma.user.findUniqueOrThrow({
      where: {
        username: username,
      },
      include: {
        chats: true
      }
    })
    const userId = u.id;

    const allUsers = await prisma.user.findMany()
    const usernames = allUsers.map(u => {
      return {
        username: u.username,
        userid: u.id,
      }
    }).filter(u => u.username !== username);
    const chatList = await Promise.all(
      (await getChatsForUser(userId)).map(async chat => {
        return {
          chatId: chat.chatId,
          userId: chat.userId,
          username: chat.username,
          lastMessage: await getLastMessageInChat(chat.chatId),
        }
      }))
    chatList.sort((x, y) => {
      const l = [x, y].map(z => z.lastMessage?.time || 0)
      return l[0] > l[1] ? -1 : 1;
    })

    const chats: ChatInfo[] = chatList.map(c => ({
      username: c.username,
      active: false,
      chatId: c.chatId,
      lastMessage: c.lastMessage,
    }))
    const usernamesAlreadyAdded = chats.map(c => c.username);
    usernames.filter(u => !usernamesAlreadyAdded.includes(u.username)).forEach(u => {
      chats.push(
        {
          active: false,
          chatId: null,
          lastMessage: null,
          username: u.username,
        })

    })
    res.json(chats)
  } catch (error) {
    res.status(500).json({message: (error as Error).message})
  }
}

export default withIronSessionApiRoute(chats, sessionOptions)
