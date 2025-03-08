"use client"

import { useState, useEffect } from "react"
import MessageContext from "@/lib/contexts/MessageContext"
import Message from "./Message/Message"

import styles from './MessageContainer.module.scss'

const MessageContainer = ({ children }) => {
    const [messages, setMessages] = useState([])

    const addMessage = data => {
        const id = Date.now()
        SpatialNavigation.add(`message-${id}`, {
            selector: `
                #message-${id} button,
                #message-${id} button.vjs-control,
                #message-${id} input
            `,
            defaultElement: `#message-${id} button`
        })
        setMessages([...messages, { ...data, id: id }])
    }

    const popMessage = () => {
        setMessages(messages.slice(0, -1))
    }

    useEffect(() => {
        document.body.classList.remove('hasMessages')
        SpatialNavigation.enable('mainNav')

        if (messages.length > 0) {
            SpatialNavigation.disable('mainNav')
            messages.forEach((message, index) => {
                if (index == (messages.length - 1)) {
                    SpatialNavigation.init();
                    SpatialNavigation.enable(`message-${message.id}`);
                    SpatialNavigation.makeFocusable(`message-${message.id}`);
                    SpatialNavigation.focus(document.querySelector(`#message${message.id} button`));
                } else {
                    SpatialNavigation.disable(`message${message.id}`);
                }
            })

            document.body.classList.add('hasMessages')
        }
        return () => {
            document.body.classList.remove('hasMessages')
        }
    }, [messages])

    return <MessageContext
        value={{
            addMessage: addMessage,
            popMessage: popMessage
        }}
    >
        <div className={`
            ${styles.MessageContainer}
            ${messages.length ? styles.enabled : ''}
        `}>
            {messages.map(message => {
                return <Message
                    key={message.id}
                    data={message}
                />
            })}
        </div>
        <div>
            {children}
        </div>
    </MessageContext>
}

export default MessageContainer