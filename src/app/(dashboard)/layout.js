import { getSession } from "@/lib/auth/auth"
import Providers from "@/lib/auth/providers"
import { redirect } from 'next/navigation'

const DashboardRootLayout = async ({ children }) => {
    const session = await getSession()
    if (session) { 
        return <>
            <p>Signed in as {session.user.email}</p>
            <Providers session={session}>
                {children}
            </Providers>
            <button onClick={() => signOut()}>Sign out</button>      
        </> 
    }
    
    redirect('/login')
}

export default DashboardRootLayout