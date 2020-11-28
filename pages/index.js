import { getSession } from 'next-auth/client'
import { useEffect } from 'react'

export default function Home(props) {

  useEffect(() => {
    if (!props.session) {
      window.location.href = '/login'
    }
  })

  return (
    <>
    </>
  )
}

export async function getServerSideProps(context) {
    const session = await getSession(context)

    if (typeof window === "undefined" && context.res.writeHead) {
        if (!session) {
            context.res.writeHead(302, { Location: "/api/auth/signin" });
            context.res.end();
            return
        }
    }

    return {
        props: { session }
    }
}
