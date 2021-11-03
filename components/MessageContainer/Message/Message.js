import styles from './Message.module.scss'
import { useEffect } from 'react'

const Message = (props) => {

    useEffect(() => {
        Keyboard.bindButtons();
    }, [])

    return (
        <div className={styles.message}>
            {props.children}
        </div>
    )
}

export default Message
