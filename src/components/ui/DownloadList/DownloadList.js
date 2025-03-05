"use client"

import { useEffect, useState } from 'react'
import styles from './DownloadList.module.scss'

const DownloadList = ({ downloads, torrents }) => {

    const [fetchStatus, setFetchStatus] = useState(0)
    const [currentDownloads, setCurrentDownloads] = useState(downloads)
    const [currentTorrents, setCurrentTorrents] = useState(torrents)
    const [nonInteractibleDownloads, setNonInteractibleDownloads] = useState([])

    const getDownloads = async () => {
        let downloads = await fetch(`/api/download`)
        setFetchStatus(downloads.status)
        downloads = await downloads.json()
        setCurrentDownloads(downloads.data.downloads)
        setCurrentTorrents(downloads.data.torrents)
    }

    const removeDownload = async download => {
        setNonInteractibleDownloads([...nonInteractibleDownloads, download])
        let response = await fetch(`/api/download/${download.id}`, {
            method: "DELETE"
        })
        response = await response.json()
    }

    const updateDownloadState = async (download, action) => {
        setNonInteractibleDownloads([...nonInteractibleDownloads, download])
        let response = await fetch(`/api/download/${download.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: action
            })
        })
        response = await response.json()
    }

    const reconcileNonInteractibleDownloads = () => {
        if (fetchStatus !== 200) return;

        const downloads = currentDownloads.reduce((acc, item) => {
            acc[item.id] = item
            return acc;
        }, {})
        const nonIntDls = nonInteractibleDownloads.reduce((acc, item) => {
            acc[item.id] = item
            return acc;
        }, {})

        for (const id of Object.keys(nonIntDls)) {
            // Once the download we have in our canonical state does not match the saved object in the nonInt array,
            // remove it from the nonInt array; the state has been updated.
            if (JSON.stringify(downloads[id]) !== JSON.stringify(nonIntDls[id])) {
                setNonInteractibleDownloads(nonInteractibleDownloads.filter(item => item.id !== id))
            }
        }
    }

    useEffect(() => {
        reconcileNonInteractibleDownloads()
    }, [currentDownloads])
    
    useEffect(() => {
        let downloadPoll = setInterval(() => {
            getDownloads()
        }, 1000)

        return () => {
            clearInterval(downloadPoll)
        }
    }, [])

    return <div className={styles.DownloadList}>
        {currentDownloads.length > 0 ?
            currentDownloads.map(download => {
                return <div
                    key={download.id}
                    className={`
                        ${styles.download}
                        ${nonInteractibleDownloads.reduce((acc, obj) => {
                            acc.push(obj.id)
                            return acc
                        }, []).includes(download.id) ? styles.nonInteractible : ''}
                    `}
                >
                    <span>{download.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: "0.5rem" }}>

                        <span>{(currentTorrents[download.transmissionId]?.progress * 100).toFixed(2)}%</span>

                        {download.state === 'downloading' ?
                            <button
                                className={`unstyled ${styles.pauseBtn}`}
                                onClick={() => updateDownloadState(download, 'pause')}
                            >
                                <span className='material-icons'>pause</span>
                            </button>
                            : <button
                                className={`unstyled ${styles.resumeBtn}`}
                                onClick={() => updateDownloadState(download, 'resume')}
                            >
                                <span className='material-icons'>play_arrow</span>
                            </button>
                        }

                        <button
                            className={`unstyled ${styles.removeBtn}`}
                            onClick={() => removeDownload(download)}
                        >
                            <span className='material-icons'>cancel</span>
                        </button>
                    </div>
                </div>
            })
            : <div className={styles.emptyAlert}>
                <span className="material-icons">all_out</span>
                {fetchStatus === 502 ?
                    <span>Error: the transmission-daemon service is not running.</span>
                    : <span>Nothing here!<br />Why not start some downloads?</span>
                }
            </div>
        }

    </div >
}

export default DownloadList
