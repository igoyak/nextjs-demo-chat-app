import type {User} from './user'

import {withIronSessionApiRoute} from 'iron-session/next'
import {sessionOptions} from 'lib/session'
import {NextApiRequest, NextApiResponse} from 'next'
import prisma from "../../lib/prisma";
import {serverWebsocketClient} from "../../lib/websocketServerClient";

async function handler(req: NextApiRequest, res: NextApiResponse) {

  try {
    const existingUsernames = (await prisma.user.findMany())
      .map(u => u.username)
    const username = names
      .filter(n => !existingUsernames.includes(n))[0]
    const user: User = {isLoggedIn: true, login: username, websocketsToken: ''}

    await prisma.user.create({
      data: {
        username: username,
      }
    })
    req.session.user = user
    await req.session.save()
    await serverWebsocketClient.emit('usersUpdated')
    res.json(user)
  } catch (error) {
    res.status(500).json({message: (error as Error).message})
  }
}

export default withIronSessionApiRoute(handler, sessionOptions)

const names: string[] = [
  "Matt", "Frank", "Deirdre", "Jane", "Amy", "John", "Sally", "Sophie", "Leah", "Angela", "Jane", "Karen", "Penelope"
]