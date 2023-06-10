import Link from 'next/link'
import {useRouter} from 'next/router'
import fetchJson from 'lib/fetchJson'
import {useUser} from "../lib/swrCalls";

export default function Header() {
  const {user, mutateUser} = useUser()
  const router = useRouter()

  return (
    <header
      style={{
        borderBottom: '1px solid grey'
      }}
    >
      <nav>
        <ul>
          <li>
            <Link href="/" legacyBehavior>
              <a>Home </a>
            </Link>
          </li>
          {user?.isLoggedIn === false && (
            <>
              <li>
                <Link href="/createUser" legacyBehavior>
                  <a>Login / Create user</a>
                </Link>
              </li>
            </>
          )}
          {user?.isLoggedIn === true && (
            <>
              <li>
                <p>Logged in as <b>{user.login}</b></p>
              </li>
              <li>
                <a style={{color: "red"}}
                   href="/api/logout"
                   onClick={async (e) => {
                     e.preventDefault()
                     mutateUser(
                       await fetchJson('/api/logout', {method: 'POST'}),
                       false
                     )
                     router.push('/createUser')
                   }}
                >
                  Logout / Delete User
                </a>
              </li>
            </>
          )}
        </ul>
      </nav>
      <style jsx>{`
        ul {
          display: flex;
          list-style: none;
          margin-left: 0;
          padding-left: 0;
        }

        li {
          margin-right: 1rem;
          display: flex;
        }

        li:first-child {
          margin-left: auto;
        }

        a {
          text-decoration: none;
          display: flex;
          align-items: center;
        }

        a img {
          margin-right: 1em;
        }

        header {
          padding: 0.2rem;
        }
      `}</style>
    </header>
  )
}
