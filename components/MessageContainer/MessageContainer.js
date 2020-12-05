import { Component, cloneElement, useContext } from 'react'
import styles from './MessageContainer.module.scss'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Router from 'next/router'
import AppContext from '@/components/AppContext.js'

const MessageContainer = (props) => {
    const context = useContext(AppContext)

    return (
        <>
            {props.messages.map((message, index) => {
                return (
                    <div className={`
                        ${styles.messageContainer}
                    `}>
                        <div className={styles.closeButton}>
                            <FontAwesomeIcon 
                                icon={faTimes} 
                                onClick={() => context.globalFunctions.closeMessage()}
                            />
                        </div>
                        {message.content ? message.content : ''}
                    </div>
                )
            })}
        </>
    )
}

export default MessageContainer
