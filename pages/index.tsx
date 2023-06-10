import Layout from 'components/Layout'


export default function Home() {
  return (
    <Layout>
      <p>Select a user on the left to start a chat</p>

      <style jsx>{`
        li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </Layout>
  )
}
