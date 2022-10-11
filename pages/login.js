import { csrfToken, getSession } from 'next-auth/client'
import PosterBg from '@/components/PosterBg/PosterBg.js'
import Head from 'next/head'

export default function SignIn({ csrfToken }) {


  return (
    <>
      <Head>
        <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
      </Head>

      <div className='loginContainer'>

        <PosterBg />

        <form className='loginForm' method='post' action='/api/auth/callback/credentials'>
          <input name='csrfToken' type='hidden' defaultValue={csrfToken}/>
          <lottie-player src="https://assets4.lottiefiles.com/packages/lf20_PclCeNBIjw.json"  background="transparent"  speed="1"  style={{pointerEvents: 'none', width: '100%', height: '200px;', transform: 'scale(1.5);'}}  autoplay></lottie-player>
          <label>
            <h2>Password</h2>
            <input name='password' id='password' type='password'/>
          </label>
          <button type='submit'>Sign in</button>
        </form>

      </div>
    </>
  )
}

SignIn.getInitialProps = async (context) => {
  const session = await getSession(context)

  if (session) {
    context.res.writeHead(302, { Location: "/" });
    context.res.end();
    return
  }

  return {
    csrfToken: await csrfToken(context)
  }
}