import Link from 'next/link'
import useSWR from "swr";
import React, {useEffect} from "react";
import {ChatInfo} from "../pages/api/chats";
import {notificationSocket} from "../lib/websocketsBrowserClient";
import {useSWRConfig} from "swr"
import {constructMessagesPath, useMessages, useUser} from "../lib/swrCalls";
import {fuzzyTime} from "../lib/misc";
import {useRouter} from "next/router";

let PATH_CHATS = '/api/chats';

export default function ChatsSidebar() {
  const {user} = useUser({
    redirectTo: '/createUser',
  })
  const {mutate} = useSWRConfig()

  useEffect(() => {
    if (user) {
      notificationSocket.emit('hello', user.websocketsToken)
      notificationSocket.on('chatUpdated', function (payload) {
        mutate(constructMessagesPath(payload.chatId))
      });
      notificationSocket.on('usersUpdated', function () {
        mutate(PATH_CHATS)
      });
    }
  }, [user]);

  const {data} = useSWR<ChatInfo[]>(user?.login ? PATH_CHATS : null)

  const chats = (data ?? []).map(u => {
    const link = `/chat/${u.username}`;
    return {
      username: u.username,
      link,
      lastMessage: u.lastMessage,
    }
  })

  const router = useRouter();
  const otherUsernameFromPath = router.query.userId

  return (
    <div style={{
      borderRight: "1px solid grey",
      height: "100%",
      width: '25%',
      position: 'fixed',
      overflow: 'auto',
    }}>
      {chats && (
        chats.map((e, i) =>
          <div key={i}
               style={{
                 border: "1px solid grey",
                 width: "100%",
                 height: "60px",
                 textAlign: "center",
                 backgroundColor: e.username === otherUsernameFromPath ? "#ddd" : 'inherit',

               }}
          >
            <Link href={e.link} legacyBehavior>
              <a style={{
                textAlign: "center",
                textDecoration: "none",
                color: '#020202',
              }}>
                  <span
                  >{e.username.slice(0, 8)} </span>
                <br/>
                {e.lastMessage ?
                  <div style={{
                    fontSize: "x-small"
                  }}>
                    <span>{e.lastMessage.username}: {e.lastMessage.content.slice(0, 24)} </span>
                    <br/>
                    <span>{fuzzyTime(Math.round(Date.now() / 1000) - e.lastMessage.time)} </span>
                  </div> : <div/>}
              </a>
            </Link>
          </div>)
      )}
    </div>
  )
}

