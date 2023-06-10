import Head from 'next/head'
import Header from 'components/Header'
import ChatsSidebar from "components/ChatsSidebar";
import {appName} from "../lib/constants";
import {useUser} from "../lib/swrCalls";


export default function Layout({children}: { children: React.ReactNode }) {
  const {user} = useUser({
    redirectTo: '/createUser',
  })
  return (
    <>
      <Head>
        <title>{appName}</title>
      </Head>
      <style jsx global>{`
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          'Helvetica Neue', Arial, Noto Sans, sans-serif, 'Apple Color Emoji',
          'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
        }

        .container {
          max-width: 65rem;
          margin: 1.5rem auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }
      `}</style>
      {user?.login ? <div>
        <Header/>
        <ChatsSidebar/>
        <main style={{marginLeft: "25%"}}>
          <div className="container">{children}</div>
        </main>
      </div> : <div>
        <main>
          <div className="container">{children}</div>
        </main>

      </div>}

    </>
  )
}
