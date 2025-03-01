"use client"

import { SessionProvider } from "next-auth/react"

export default Providers = ({ session, children }) => {
    return <SessionProvider session={session}>
        {children}
    </SessionProvider>
}