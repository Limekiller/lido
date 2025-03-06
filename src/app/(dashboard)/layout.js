import { getSession } from "@/lib/auth/auth"
import Providers from "@/lib/auth/providers"
import { redirect } from 'next/navigation'

import Search from "@/components/ui/Search/Search"
import Navbar from "@/components/ui/Navbar/Navbar"

const DashboardRootLayout = async ({ children }) => {
    const session = await getSession()
    
    if (session) { 
        return <>
            <Providers session={session}>
                <Navbar />
                <Search />
                <div className="pageContainer">
                    {children}
                </div>
            </Providers>
        </> 
    }
    
    redirect('/login')
}

export default DashboardRootLayout