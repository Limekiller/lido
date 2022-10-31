import { useState, useEffect } from 'react'
import styles from './Chat.module.scss'

function Chat(props) {
    const [copyIcon, setcopyIcon] = useState("copy.svg")
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
        navigator.clipboard.writeText(e.target.dataset.link)
        setcopyIcon("check.svg")

        e.target.style.transform = 'scale(1)'
        setTimeout(() => e.target.style.transform = '', 200)

        setTimeout(() => setcopyIcon("copy.svg"), 2000)
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
                    {props.users.map((user) => {
                        return <span key={user}>{user}</span>
                    })}
                </div>

                <div className={styles.buttonContainer}>
                    <div className={styles.toggle} onClick={() => {props.onChatOpen(!open); setOpen(!open); setunread(false)}}>
                        <div className={`${styles.unreadNotif} ${unread ? styles.active : ''}`} />
                        <img src="/images/icons/chat.svg" />
                    </div>
                    <div 
                        className={styles.roomLink}
                        data-link={`${props.URL}/party?room=${props.room}`}
                        onClick={(e) => copyLink(e)}
                    >
                        <img src={`/images/icons/${copyIcon}`} style={{marginRight: "0.5rem", height: "65%"}} />
                        Copy room link
                    </div>
                </div>

                <div className={styles.messageContainer}>
                    {props.messages.map((messageObj, index) => {
                        return <div 
                            className={`
                                ${styles.message} 
                                ${props.username == messageObj.username ? styles.self : ''}
                                ${styles[messageObj.type]}
                                ${messageObj.username == props.messages[Math.min(index+1, props.messages.length-1)].username ? styles.grouped : ''}
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