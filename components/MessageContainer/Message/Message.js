import styles from './Message.module.scss'

const Message = (props) => {

    return (
        <>
            <div className={` ${styles.message} message`}>
                {props.children}
            </div>
            <style jsx>{`
                .message {
                    padding: ${props.children.length > 1 ? '20px' : ''};
                }
            `}</style>
        </>
    )
}

export default Message
