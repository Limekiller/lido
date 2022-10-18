import { useState, useEffect } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons'

import styles from './Chat.module.scss'

function Chat(props) {
    const [copyIcon, setcopyIcon] = useState(faCopy)
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
        setcopyIcon(faCheck)

        e.target.style.transform = 'scale(1)'
        setTimeout(() => e.target.style.transform = '', 200)

        setTimeout(() => setcopyIcon(faCopy), 2000)
    }

    return (
        <div className={styles.Chat}>
            <div 
                className={`
                    ${styles.window}
                    ${open ? styles.open : ''}
                `}
            >
                <div className={styles.buttonContainer}>
                    <div className={styles.toggle} onClick={() => {setOpen(!open); setunread(false)}}>
                        <div className={`${styles.unreadNotif} ${unread ? styles.active : ''}`} />
                        <FontAwesomeIcon icon={faComment}/>
                    </div>
                    <div 
                        className={styles.roomLink}
                        data-link={`${props.URL}/party?room=${props.room}`}
                        onClick={(e) => copyLink(e)}
                    >
                        <FontAwesomeIcon
                            icon={copyIcon}
                            style={{marginRight: "0.75rem"}}
                        />
                        Copy room link
                    </div>
                </div>

                <div className={styles.messageContainer}>
                    {props.messages.map((messageObj, index) => {
                        return <div className={`${styles.message} ${props.username == messageObj.username ? styles.self : ''}`} key={index}>
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