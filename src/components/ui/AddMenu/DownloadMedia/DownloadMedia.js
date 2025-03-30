"use client"

import { useState, useContext } from 'react'
import { usePathname } from 'next/navigation'

import MessageContext from '@/lib/contexts/MessageContext'
import ToastContext from '@/lib/contexts/ToastContext'
import Spinner from '@/components/ui/Spinner/Spinner'
import styles from './DownloadMedia.module.scss'
import DownloadResultList from '../../DownloadResultList/DownloadResultList'

const DownloadMedia = () => {
    const messageFunctions = useContext(MessageContext)
    const toastFunctions = useContext(ToastContext)

    const pathname = usePathname() 
    let category = pathname.split('/').slice(-1)[0]
    if (category === 'movies') {
        category = 0
    } else if (category === 'tv') {
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
                    <DownloadResultList results={results} category={category} />
                </div>
            : ""
        }
    </div>
}

export default DownloadMedia