import prisma from "./prisma";

export async function getUsernamesInChat(chatId: number) {
  const result = await prisma.$queryRaw<{ username: string }[]>`
    select distinct user.username from user 
        left join ChatUserMap on user.id = ChatUserMap.userId 
        where chatId = ${chatId};
    `;
  return result.map(u => u.username);
}

export async function getChatId(untrustedChatId: number, userId: number) {
  const result: { chatId: number }[] = await prisma.$queryRaw<{ chatId: number }[]>`
    select a.chatId from ChatUserMap a 
        where a.chatId = ${untrustedChatId}
            and a.userId = ${userId}
    `;
  return result.length > 0 ? result[0].chatId : null;
}


export async function userIdFromUsername(username: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      username: username,
    },
  })
  return user.id;
}


export async function getChatsForUser(userId: number) {
  return prisma.$queryRaw<{
    chatId: number,
    userId: number,
    username: string,
  }[]>`
    select chatId, ChatUserMap.userId, user.username 
        from ChatUserMap 
        left join user on ChatUserMap.userId = user.id 
        where userId != ${userId} 
        and chatId in 
            (select chatId from ChatUserMap where userId = ${userId}); `;
}

export async function getLastMessageInChat(chatId: number) {
  const lastMessageList = await prisma.$queryRaw<{
    userId: number,
    username: string,
    time: number,
    content: string,
  }[]>`
        select user.username, userId,  content, time from Message 
            left join user on user.id = message.userId
            where chatId = ${chatId} order by time desc limit 1
        `;
  return lastMessageList.length > 0 ? lastMessageList[0] : null;
}
