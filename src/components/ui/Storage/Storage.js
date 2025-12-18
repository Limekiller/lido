"use client"

import { useEffect, useState } from 'react'
import styles from './Storage.module.scss'

import { get } from '@/lib/actions/storage'

const Storage = () => {

    const [storageData, setStorageData] = useState([])

    useEffect(() => {
        get()
        .then(response => setStorageData(response.data))
    }, [])

    if (storageData[4]) {
        let from, to
        if (storageData[4].slice(0, -1) > 90) {
            from = 'darkred'
            to = '#f44848'
        } else {
            from = 'gold'
            to = 'orange'
        }

        return (
            <div className={styles.spaceUsage}>

                <div className={styles.inner}>
                    <span className={styles.percent}>{storageData[4]}</span>
                    {/* <span className={styles.details}>({storageData[2]}/{storageData[1]})</span> */}
                </div>
                
                <style jsx>{`
                    .${styles.spaceUsage} {
                        ${'background: conic-gradient(' + from + ' ' + 
                            storageData[4].slice(0, -1) / 2 + 
                            '%, ' + to + ' ' + storageData[4] + 
                            ', #6c6c6c ' + storageData[4] + ');'};
                    }
                `}</style>
            </div>
        )
    } else {
        return null
    }
    
}

export default Storage