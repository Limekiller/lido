"use client"

import { useState, useContext, use } from 'react'
import MessageContext from '@/lib/contexts/MessageContext'
import ToastContext from '@/lib/contexts/ToastContext'

import MoveFile from '../MoveFile/MoveFile'
import styles from './DownloadResultList.module.scss'

const DownloadResultList = ({ 
    results,
    category = null
 }) => {
    const messageFunctions = useContext(MessageContext)
    const toastFunctions = useContext(ToastContext)

    results = typeof results === 'object' && typeof results?.then === 'function' ? use(results) : results

    const initiateDownload = async (download, category = null) => {
        category = category == null ? document.querySelector('#activeCat').value : category
        const data = {
            name: download.name,
            category: category,
            magnet: download.link
        }

        let response = await fetch(`/api/download`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        response = await response.json()

        if (response.result === 'success') {
            messageFunctions.popMessage()
            toastFunctions.createToast({message: "Download started!"})
        } else {
            toastFunctions.createToast({message: response.data.message})
        }
    }

    const selectDownload = download => {
        if (category != null) {
            initiateDownload(download, category)
            return
        }
        messageFunctions.addMessage({
            title: "Choose category",
            body: <>
                <p>Which category do you want to save this in?</p>
                <MoveFile 
                    label="Save in "
                />
            </>,
            onSubmit: () => initiateDownload(download)
        })
    }

    return <div className={styles.DownloadResultList}>
        {results === null ?

            new Array(6).fill(0).map((num, index) => {
                return <div 
                    className={`${styles.download} ${styles.loading}`} 
                    key={index} 
                    style={{
                        animationDelay: `${index / 10}s`
                    }}
                >&nbsp;</div>
            }) :

            results.length === 0 ? "No results" :

                results.map(result => {
                    return <button
                        className={`${styles.download} unstyled`}
                        key={result.link}
                        onClick={() => selectDownload(result)}
                    >
                        <span>{result.name}</span>
                        <div className={styles.trackerData}>
                            <span className={styles.seeders}>{result.seeders}</span>
                            <span className={styles.leechers}>{result.leechers}</span>
                        </div>
                    </button>
                })
        }
    </div>
}

export default DownloadResultList