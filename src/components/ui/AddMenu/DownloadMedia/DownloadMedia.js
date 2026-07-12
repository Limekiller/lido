"use client"

import { useState, useContext } from 'react'
import { usePathname } from 'next/navigation'

import ToastContext from '@/lib/contexts/ToastContext'
import Spinner from '@/components/ui/Spinner/Spinner'
import styles from './DownloadMedia.module.scss'
import DownloadResultList from '../../DownloadResultList/DownloadResultList'

import { search } from '@/lib/actions/search'
import PillSelector from '../../PillSelector/PillSelector'

const DownloadMedia = () => {
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
    const [hasSearched, setHasSearched] = useState(false)
    const [source, setSource] = useState(0)

    const getResults = async query => {
        setIsSearching(true)
        let searchResponse = await search(query, source)
        if (searchResponse.result === 'success') {
            setHasSearched(true)
            setResults(searchResponse.data)
        } else {
            toastFunctions.createToast({message: "Failed to fetch results", type: "alert"})
            setResults([])
        }
        setIsSearching(false)
    }

    return <div className={styles.DownloadMedia}>
        <PillSelector 
            options={[{label: "Source 1", value: 0}, {label: "Source 2", value: 1}]} 
            parentSetFunction={setSource}
        />
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