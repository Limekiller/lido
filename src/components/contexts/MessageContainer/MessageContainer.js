"use client"

import { useState } from "react"
import MessageContext from "@/lib/contexts/MessageContext"
import Message from "./Message/Message"

import styles from './MessageContainer.module.scss'

const MessageContainer = ({ children }) => {
    const [messages, setMessages] = useState([])

    const addMessage = data => {
        setMessages([...messages, {...data, id: Date.now()}])
    }

    const popMessage = () => {
        setMessages(messages.slice(0, -1))
    }

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
        <div inert={messages.length > 0}>
            {children}
        </div>
    </MessageContext>
}

export default MessageContainer