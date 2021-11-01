import { Component, cloneElement, useContext } from 'react'
import styles from './MessageContainer.module.scss'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Router from 'next/router'
import AppContext from '@/components/AppContext.js'
import { useEffect } from 'react'

const MessageContainer = (props) => {
    const context = useContext(AppContext)

    // When a message appears, we want to move focus to it and CONSTRAIN focus to only the new message
    // When a message is cleared, we want to move focus to the message that is now on top of the stack
    // Every time this component updates, we iterate through messages and disable spatial nav for each one except the last
    // Message IDs are tracked by the higher-order component _app.js that maintains message stack state
    useEffect(() =>{
        props.messages.length ? SpatialNavigation.disable('mainNav') : SpatialNavigation.enable('mainNav')
        props.messages.forEach((message, index) => {
            if (index == (props.messages.length - 1)) {
                SpatialNavigation.init();
                SpatialNavigation.enable(`message${message.id}`);
                SpatialNavigation.makeFocusable(`message${message.id}`);
                SpatialNavigation.focus(document.querySelector(`.message${message.id} button`));
            } else {
                SpatialNavigation.disable(`message${message.id}`);
            }
        })
    })

    return (
        <>
            {props.messages.map((message, index) => {
                return (
                    <div 
                        key={index}
                        className={`
                            ${styles.messageContainer}
                            message
                            message${message.id}
                        `}
                    >
                        {message.content ? message.content : ''}
                    </div>
                )
            })}
        </>
    )
}

export default MessageContainer
