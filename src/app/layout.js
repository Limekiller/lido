import '@/styles/global.scss'
import '@/styles/external/material-icons.css'
import '@/styles/external/typekit.css'

import MessageContainer from '@/components/contexts/MessageContainer/MessageContainer'
import ToastContainer from '@/components/contexts/ToastContainer/ToastContainer'
import ContextMenuContainer from '@/components/contexts/ContextMenuContainer/ContextMenuContainer'

const RootLayout = async ({ children }) => {
    return <html lang="en">
        <body>
            <ContextMenuContainer>
                <ToastContainer>
                    <MessageContainer>
                        {children}
                    </MessageContainer>
                </ToastContainer>
            </ContextMenuContainer>
        </body>
    </html> 
}

export default RootLayout