import { prisma } from '@/lib/prisma';
import { getSession } from "@/lib/auth/auth"
import { redirect } from 'next/navigation'

import PosterBg from "@/components/auth/PosterBg/PosterBg"
import AccountSelector from "@/components/auth/AccountSelector/AccountSelector"

const login = async ({ csrfToken }) => {
    const session = await getSession()
    if (session) {
        redirect('/')
    }

    const accounts = await prisma.user.findMany()

    return <div>
        <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>

        <PosterBg />

        <div style={{
            height: '100vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            position: 'relative'
        }}>
            <lottie-player src="https://assets4.lottiefiles.com/packages/lf20_PclCeNBIjw.json"  background="transparent"  speed="1"  style={{pointerEvents: 'none', width: '100%', height: '200px', transform: 'scale(1.5)'}}  autoplay></lottie-player>
            <AccountSelector accounts={accounts} />
        </div>
    </div>
}

export default login