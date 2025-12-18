"use client"

import { useState } from 'react'
import { usePathname } from 'next/navigation'

import Spinner from '@/components/ui/Spinner/Spinner'
import styles from './DownloadMedia.module.scss'
import DownloadResultList from '../../DownloadResultList/DownloadResultList'

import { search } from '@/lib/actions/search'

const DownloadMedia = () => {
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
        let searchResponse = await search(query)
        if (searchResponse.result === 'success') {
            setResults(searchResponse.data)
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