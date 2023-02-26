import { getServerSession } from 'next-auth/next'
import { useEffect } from 'react'
import Search from '@/components/Search/Search.js'
import SpaceUsage from '@/components/home/SpaceUsage/SpaceUsage.js'
import VPN from '@/components/home/VPN/VPN.js'

export default function Home(props) {

  // useEffect(() => {
  //   if (!props.session) {
  //     window.location.href = '/login'
  //   }
  // })

  return (
    <>
      <div className='home'>
        <img className='logo' src='/images/lidoWhite.svg' />
        <Search _style='fancy' />
        <div className='dashboardModules'>
          <SpaceUsage />
          <VPN />
        </div>
      </div>
    </>
  )
}

export async function getServerSideProps(context) {
    const session = await getServerSession(context.req, context.res)

    if (typeof window === "undefined" && context.res.writeHead) {
        if (!session) {
            context.res.writeHead(302, { Location: "/api/auth/signin" });
            context.res.end();
            return
        }
    }

    return {
        props: {}
    }
}
