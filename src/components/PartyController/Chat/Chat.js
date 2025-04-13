import { useState, useEffect } from 'react'
import styles from './Chat.module.scss'

function Chat(props) {
    const [copyIcon, setcopyIcon] = useState('content_copy')
    const [open, setOpen] = useState(false)
    const [unread, setunread] = useState(false)

    useEffect(() => {
        if (!open) {
            setunread(true)
        }
    }, [props.messages])

    const submitMessage = (e) => {
        if (e.code == "Enter") {
            const msg = e.target.value
            e.target.value = ""
            props.messageFunction(msg)
        }
    }

    const copyLink = (e) => {
        navigator.clipboard.writeText(window.location.href)
        setcopyIcon("done")

        e.target.style.transform = 'scale(1)'
        setTimeout(() => e.target.style.transform = '', 200)
        setTimeout(() => setcopyIcon("content_copy"), 2000)
    }

    return (
        <div className={styles.Chat}>
            <div
                className={`
                    ${styles.window}
                    ${open ? styles.open : ''}
                `}
            >
                <div className={styles.userList}>
                    {props.users?.map((user) => {
                        return user ? <span key={user}>{Buffer.from(user, 'base64').toString('ascii')}</span> : ''
                    })}
                </div>

                <div className={styles.buttonContainer}>
                    <div className={styles.toggle} onClick={() => { props.onChatOpen(!open); setOpen(!open); setunread(false) }}>
                        <div className={`${styles.unreadNotif} ${unread ? styles.active : ''}`} />
                        <span className='material-icons'>chat</span>
                    </div>
                    <div
                        className={styles.roomLink}
                        onClick={(e) => copyLink(e)}
                        style={{display: 'flex', gap: '0.5rem'}}
                    >
                        <span className='material-icons'>{copyIcon}</span>
                        Copy room link
                    </div>
                </div>

                <div className={styles.messageContainer}>
                    {props.messages.map((messageObj, index) => {
                        const getMessageType = () => {
                            let type = 0
                            // Last message of group
                            if (!props.messages[index - 1] || props.messages[index - 1]?.username !== messageObj.username) {
                                type += 1
                            }
                            // First message of group
                            if (!props.messages[index + 1] || props.messages[index + 1]?.username !== messageObj.username) {
                                type += 2
                            }
                            return type
                        }
                        const messageType = getMessageType()
                        return <div
                            className={`
                                ${styles.message} 
                                ${props.username == messageObj.username ? styles.self : ''}
                                ${styles[messageObj.type]}
                                ${messageType === 0 ? styles.middle : ''}
                                ${messageType === 1 || messageType === 3 ? styles.last : ''}
                                ${messageType === 2 || messageType === 3 ? styles.first : ''}
                            `}
                            key={index}
                        >
                            <span className={styles.nameLabel}>{messageObj.username}</span>
                            {messageObj.message}
                        </div>
                    })}
                </div>
                <input onKeyDown={submitMessage} placeholder="Type a message..."></input>
            </div>
        </div>
    )
}

export default Chat