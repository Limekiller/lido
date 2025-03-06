"use client"

import { useContext, useEffect } from 'react'
import MessageContext from '@/lib/contexts/MessageContext'

import styles from './Message.module.scss'

const Message = ({ data }) => {
    const messageFunctions = useContext(MessageContext)

    useEffect(() => {
        document.querySelector(`#submit-${data.id}`)?.focus()
    }, [])

    return data.hideBoilerplate ? 
        <div>{data.body}</div>
    :
        <div className={`${styles.Message} messageParent`} data-messageid={data.id}>
            <h1>{data.title}</h1>
            <div style={{marginTop: '1rem'}}>{data.body}</div>
            <div className={styles.actions}>
                <button id={`submit-${data.id}`} className="messageSubmit" onClick={data.onSubmit}>Ok</button>
                <button className="secondary" onClick={messageFunctions.popMessage}>Cancel</button>
            </div>
        </div>
}

export default Message