import {withIronSessionApiRoute} from 'iron-session/next'
import {sessionOptions} from 'lib/session'
import {NextApiRequest, NextApiResponse} from 'next'
import jwt from 'jsonwebtoken'
import {jwtSigningSecret, WebsocketTokenPayload} from "../../lib/websocketShared";

export type User = {
  isLoggedIn: boolean
  login: string
  websocketsToken: string
}

async function userRoute(req: NextApiRequest, res: NextApiResponse<User>) {
  if (req.session.user) {
    const websocketsTokenPayload: WebsocketTokenPayload = {
      username: req.session.user.login,
      isServer: false,
    }
    res.json({
      ...req.session.user,
      isLoggedIn: true,
      websocketsToken: jwt.sign(websocketsTokenPayload, jwtSigningSecret, {algorithm: 'HS256'})
    })
  } else {
    res.json({
      isLoggedIn: false,
      login: '',
      websocketsToken: '',
    })
  }
}

export default withIronSessionApiRoute(userRoute, sessionOptions)
