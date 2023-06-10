import {withIronSessionApiRoute} from 'iron-session/next'
import {sessionOptions} from 'lib/session'
import {NextApiRequest, NextApiResponse} from 'next'
import prisma from "../../lib/prisma";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  async function getChatId(u1id: number, u2id: number) {
    const result: { chatId: number }[] = await prisma.$queryRaw<{ chatId: number }[]>`
    select a.chatId from ChatUserMap a 
      left join ChatUserMap b on a.chatId = b.chatId 
      where a.userId != b.userId 
          and a.userId = ${u1id} and b.userId = ${u2id}`
    return result.length > 0 ? result[0].chatId : null;
  }

  try {
    const otherUsername = req.query.username as string
    // @ts-ignore
    const username = req.session.user.login;

    const u1 = await prisma.user.findUniqueOrThrow({
      where: {
        username: username,
      }
    })
    const u2 = await prisma.user.findUniqueOrThrow({
      where: {
        username: otherUsername,
      }
    })
    const u1id = u1.id;
    const u2id = u2.id;
    let chatId = await getChatId(u1id, u2id);

    if (chatId === null) {
      await prisma.$transaction(async (tx) => {
        const newChat = await tx.chat.create({data: {name: "default"}});
        const newChatId = newChat.id;
        await tx.$executeRaw`
        insert into chatusermap (chatId, userId) values (${newChatId}, ${u1id});
      `;
        await tx.$executeRaw`
        insert into chatusermap (chatId, userId) values (${newChatId}, ${u2id});
      `;
      });
      chatId = await getChatId(u1id, u2id);
    }
    res.json({chatId: chatId})
  } catch (error) {
    console.log(error)
    res.status(500).json({message: (error as Error).message})
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)
