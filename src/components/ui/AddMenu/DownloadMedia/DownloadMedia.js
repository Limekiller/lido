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
    const [hasSearched, setHasSearched] = useState(false)
    const [source, setSource] = useState(0)

    const getResults = async query => {
        setIsSearching(true)
        let searchResponse = await search(query, source)
        if (searchResponse.result === 'success') {
            setHasSearched(true)
            setResults(searchResponse.data)
        }
        setIsSearching(false)
    }

    return <div className={styles.DownloadMedia}>
        <div className={styles.sourceSelector}>
            <button className={`secondary ${source === 0 ? styles.selected : ''}`} onClick={() => setSource(0)}>Source 1</button>
            <button className={`secondary ${source === 1 ? styles.selected : ''}`} onClick={() => setSource(1)}>Source 2</button>
        </div>
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
                : hasSearched ? <span style={{ display: 'flex', marginTop: '1rem', justifyContent: 'center' }}>No results found. Try refining your search, such as by adding a year</span> : ""
        }
    </div>
}

export default DownloadMedia