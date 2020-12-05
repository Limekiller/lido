import styles from './Message.module.scss'

const Message = (props) => {
    return (
        <div className={styles.message}>
            {props.children}
        </div>
    )
}

export default Message
