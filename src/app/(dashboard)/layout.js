import { getSession } from "@/lib/auth/auth"
import Providers from "@/lib/auth/providers"
import { redirect } from 'next/navigation'

import Navbar from "@/components/Navbar/Navbar"

const DashboardRootLayout = async ({ children }) => {
    const session = await getSession()
    
    if (session) { 
        return <>
            <Providers session={session}>
                <Navbar />
                <div className="pageContainer">
                    {children}
                </div>
            </Providers>
        </> 
    }
    
    redirect('/login')
}

export default DashboardRootLayout