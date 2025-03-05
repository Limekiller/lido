import '@/styles/global.scss'

import MessageContainer from '@/components/MessageContainer/MessageContainer'
import ToastContainer from '@/components/ToastContainer/ToastContainer'
import ContextMenuContainer from '@/components/ContextMenuContainer/ContextMenuContainer'

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