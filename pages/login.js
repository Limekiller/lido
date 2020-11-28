import { csrfToken, getSession } from 'next-auth/client'
import { useEffect } from 'react'
import PosterBg from '@/components/PosterBg/PosterBg.js'

export default function SignIn({ csrfToken }) {


  return (
    <div className='loginContainer'>

      <PosterBg />

      <form className='loginForm' method='post' action='/api/auth/callback/credentials'>
        <input name='csrfToken' type='hidden' defaultValue={csrfToken}/>
        <label>
          <h2>Password</h2>
          <input name='password' id='password' type='password'/>
        </label>
        <button type='submit'>Sign in</button>
      </form>

    </div>
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