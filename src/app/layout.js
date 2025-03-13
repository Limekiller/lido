import '@/styles/global.scss'
import '@/styles/external/material-icons.css'
import '@/styles/external/typekit.css'

import NextTopLoader from 'nextjs-toploader';

import ToastContainer from '@/components/contexts/ToastContainer/ToastContainer'
import ContextMenuContainer from '@/components/contexts/ContextMenuContainer/ContextMenuContainer'

import SpatialNav from '@/components/ui/SpatialNav/SpatialNav'

const RootLayout = async ({ children }) => {

    return <html lang="en">
        <head>
            <script src="/js/spatialnav.js" async></script>
        </head>
        <body>
            <NextTopLoader 
                height={1}
                color='linear-gradient(to right, orange, gold)'
                crawlSpeed={500}
                speed={300}
            />
            <SpatialNav />
            <ContextMenuContainer>
                <ToastContainer>
                    {children}
                </ToastContainer>
            </ContextMenuContainer>
        </body>
    </html>
}

export default RootLayout