import {useRouter} from "next/router";
import React, {FormEvent, useEffect, useState} from "react";
import Layout from "../../components/Layout";
import useSWR from "swr";
import {useUser, useMessages} from "../../lib/swrCalls";

export default function Chat() {

  const {user} = useUser({
    redirectTo: '/createUser',
  })
  const router = useRouter();
  const otherUsername = router.query.userId
  const {
    data: chatObject,
  } = useSWR<{ chatId: number }>((user && otherUsername) ? `/api/getChatId?username=${otherUsername}` : null)

  const username = user?.login;
  const chatId = chatObject ? chatObject.chatId : null;

  const [state, setState] = React.useState(
    {
      msg: "",
      fetchTime: new Date().getTime(),
    }
  );

  const {messages, mutateMessages} = useMessages(chatId);


  function handleChange(e: React.FormEvent<HTMLInputElement>) {
    // @ts-ignore
    setState({...state, [e.target.name]: e.target.value});
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (chatId && state.msg) {
      const resp = await fetch('/api/publishMessage', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({msg: state.msg, chatId: chatId})
        }
      );
      await mutateMessages()
      const json = await resp.json();
      setState({...state, msg: ""});
    }
  }

  return (
    <Layout>
      <div style={{clear: 'both'}}>
        {messages ? messages.map((m, i) => {
          const mine = m.username === username;
          const time = new Date(0);
          time.setUTCSeconds(m.time)
          return <div key={i} style={{
            clear: 'both'
          }}>
            <div style={{
              border: '1px solid grey',
              padding: '10px',
              maxWidth: '80%',
              float: mine ? 'right' : 'left',
            }}>
              <span style={{
                fontSize: 'x-small',
                fontStyle: 'bold',
                display: mine ? 'none' : 'inherit',
              }}>{m.username}<br/></span>
              <span>{m.content}</span>
              <br/>
              <p style={{
                fontSize: 'x-small',
                fontStyle: 'bold',
                textAlign: 'right',
                lineHeight: '0.2',
              }}>
                {time.toISOString()
                  .replace(/T/, ' ')
                  .replace(/\..+/, '')}
                <br/></p>
            </div>
          </div>
        }) : <p>no data</p>}

      </div>
      <div
        style={{
          clear: 'both'
        }}
      />

      <form onSubmit={onSubmit}>
        <label>
          <input
            name="msg"
            placeholder="..."
            onChange={handleChange}
            value={state.msg}
            required/>
        </label>

        <button type="submit">Send</button>

        <style jsx>{`
          form,
          label {
            display: flex;
            flex-flow: column;
          }

          label > span {
            font-weight: 600;
          }

          input {
            padding: 8px;
            margin: 0.3rem 0 1rem;
            border: 1px solid #ccc;
            border-radius: 4px;
          }

          .error {
            color: brown;
            margin: 1rem 0 0;
          }
        `}</style>
      </form>
    </Layout>
  )
}






