"use client"

import { useState, useContext } from 'react'
import { usePathname } from 'next/navigation'

import MessageContext from '@/lib/MessageContext'
import ToastContext from '@/lib/ToastContext'
import Spinner from '@/components/ui/Spinner/Spinner'
import styles from './DownloadMedia.module.scss'

const DownloadMedia = () => {
    const messageFunctions = useContext(MessageContext)
    const toastFunctions = useContext(ToastContext)

    const pathname = usePathname() 
    let category = pathname.split('/').slice(-1)[0]
    if (category === 'movies') {
        category = 0
    } else if (category === 'TV') {
        category = 1
    }

    const [results, setResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)

    const getResults = async query => {
        setIsSearching(true)
        let response = await fetch(`/api/search/media?query=${query}`)
        response = await response.json()
        if (response.result === 'success') {
            setResults(response.data)
        }
        setIsSearching(false)
    }

    const startDownload = async (name, link) => {
        const data = {
            name: name,
            category: category,
            magnet: link
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

    return <div className={styles.DownloadMedia}>
        <div style={{ display: 'flex' }}>
            <input
                type='text'
                id='mediaSearch'
                name='mediaSearch'
                onKeyDown={e => { if (e.key === 'Enter') { document.querySelector('#mediaGo').click() } }}
            />
            <button
                id='mediaGo'
                onClick={() => getResults(document.querySelector('#mediaSearch').value)}
            >
                Go
            </button>
        </div>
        {isSearching ? <Spinner /> :
            results.length > 0 ?
                <div className={styles.results}>
                    {results.map((result, index) => {
                        return <button 
                            className={`${styles.result} unstyled`}
                            key={index}
                            onClick={() => startDownload(result.name, result.link)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '3rem' }}>
                                <span>{result.name}</span>
                                <div style={{ display: 'flex', gap: "0.5rem" }}>
                                    <span className={styles.seeders}>{result.seeders}</span>
                                    <span className={styles.leechers}>{result.leechers}</span>
                                </div>
                            </div>
                        </button>
                    })}
                </div>
            : ""
        }
    </div>
}

export default DownloadMedia