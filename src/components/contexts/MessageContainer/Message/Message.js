"use client"

import { useContext, useEffect, useState } from 'react'
import MessageContext from '@/lib/contexts/MessageContext'

import styles from './Message.module.scss'
import Spinner from '@/components/ui/Spinner/Spinner'

const Message = ({ data }) => {
    const messageFunctions = useContext(MessageContext)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        document.querySelector(`#submit-${data.id}`)?.focus()
    }, [])

    return data.hideBoilerplate ?
        <div id={`message-${data.id}`}>{data.body}</div>
        :
        <div className={`${styles.Message} messageParent ${processing ? styles.processing : ''}`} id={`message-${data.id}`}>

            {processing ? <div className={styles.spinnerContainer}>
                <Spinner />
            </div> : ""}

            <h1>{data.title}</h1>
            <div style={{ marginTop: '1rem' }}>{data.body}</div>
            {!data.hideButtons ?
                <div className={styles.actions}>
                    <button
                        id={`submit-${data.id}`}
                        className="messageSubmit"
                        onClick={async () => {setProcessing(true); await data.onSubmit(); setProcessing(false)}}
                    >
                        Ok
                    </button>
                    <button className="secondary" onClick={messageFunctions.popMessage}>Cancel</button>
                </div>
                : ""
            }
        </div>
}

export default Message