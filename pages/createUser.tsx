import React, {useState} from 'react'
import Layout from 'components/Layout'
import fetchJson, {FetchError} from 'lib/fetchJson'
import CreateUserForm from "../components/CreateUserForm";
import {appName} from "../lib/constants";
import {useUser} from "../lib/swrCalls";

export default function CreateUser() {
  // here we just check if user is already logged in and redirect to profile
  const {mutateUser} = useUser({
    redirectTo: '/',
    redirectIfFound: true,
  })

  const [errorMsg, setErrorMsg] = useState('')

  return (
    <Layout>
      <div className="login">
        <h1 style={{textAlign: 'center'}}>{appName}</h1>
        <CreateUserForm
          errorMessage={errorMsg}
          onSubmit={async function handleSubmit(event) {
            event.preventDefault()

            try {
              mutateUser(
                await fetchJson('/api/createUser', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                })
              )
            } catch (error) {
              if (error instanceof FetchError) {
                setErrorMsg(error.data.message)
              } else {
                console.error('An unexpected error happened:', error)
              }
            }
          }}
        />
      </div>
      <style jsx>{`
        .login {
          max-width: 21rem;
          margin: 0 auto;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
      `}</style>
    </Layout>
  )
}
