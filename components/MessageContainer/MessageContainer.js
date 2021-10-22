import { Component, cloneElement, useContext } from 'react'
import styles from './MessageContainer.module.scss'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Router from 'next/router'
import AppContext from '@/components/AppContext.js'
import { useEffect } from 'react'

const MessageContainer = (props) => {
    const context = useContext(AppContext)

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
