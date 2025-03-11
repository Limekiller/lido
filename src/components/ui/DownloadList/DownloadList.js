"use client"

import { useContext, useEffect, useState } from 'react'
import MessageContext from '@/lib/contexts/MessageContext'
import styles from './DownloadList.module.scss'

const DownloadList = ({ downloads, torrents }) => {
    const messageFunctions = useContext(MessageContext)

    const [fetchStatus, setFetchStatus] = useState(0)
    const [currentDownloads, setCurrentDownloads] = useState(downloads)
    const [currentTorrents, setCurrentTorrents] = useState(torrents)
    const [nonInteractibleDownloads, setNonInteractibleDownloads] = useState({})
    const [selectedTab, setSelectedTab] = useState("downloading")

    const getDownloads = async () => {
        let downloads = await fetch(`/api/download`)
        setFetchStatus(downloads.status)
        downloads = await downloads.json()
        setCurrentDownloads(downloads.data.downloads)
        setCurrentTorrents(downloads.data.torrents)
    }

    const removeDownload = async id => {
        setNonInteractibleDownloads({ ...nonInteractibleDownloads, [id]: "removed" })
        let response = await fetch(`/api/download/${id}`, {
            method: "DELETE"
        })
        response = await response.json()
    }

    const updateDownloadState = async (id, state) => {
        setNonInteractibleDownloads({ ...nonInteractibleDownloads, [id]: state })
        let response = await fetch(`/api/download/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                state: state
            })
        })
        response = await response.json()
    }

    const deleteDownload = async id => {
        let response = await fetch(`api/download/${id}`, {
            method: "DELETE"
        })
        if (response.status === 200) {
            messageFunctions.popMessage()
        }
    }

    useEffect(() => {
        const reconcileNonInteractibleDownloads = () => {
            if (fetchStatus !== 200) return;
    
            const downloads = currentDownloads.reduce((acc, item) => {
                acc[item.id] = item
                return acc;
            }, {})
    
            for (const id of Object.keys(nonInteractibleDownloads)) {
                // Once the download we have in our canonical state does not match the saved object in the nonInt array,
                // remove it from the nonInt array; the state has been updated.
                if (!downloads[id] || downloads[id].state === nonInteractibleDownloads[id]) {
                    const newNonIntDls = { ...nonInteractibleDownloads }
                    delete newNonIntDls[id]
                    setNonInteractibleDownloads(newNonIntDls)
                }
            }
        }
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

    const getInProgressDownloads = () => {
        const inProgressDownloads = currentDownloads.filter(download => ['downloading', 'paused'].includes(download.state))
        return inProgressDownloads.length > 0 ?
            inProgressDownloads.map(download => {
                return <div
                    key={download.id}
                    className={`
                        ${styles.download}
                        ${Object.keys(nonInteractibleDownloads).includes(download.id) ?
                            styles.nonInteractible :
                            ''
                        }
                    `}
                >
                    <div className={styles.topLine}>
                        <span>{download.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: "0.5rem" }}>

                            <span>{(currentTorrents[download.transmissionId]?.progress * 100).toFixed(2)}%</span>

                            {download.state === 'downloading' ?
                                <button
                                    className={`unstyled ${styles.pauseBtn}`}
                                    onClick={() => updateDownloadState(download.id, 'paused')}
                                >
                                    <span className='material-icons'>pause</span>
                                </button>
                                : <button
                                    className={`unstyled ${styles.resumeBtn}`}
                                    onClick={() => updateDownloadState(download.id, 'downloading')}
                                >
                                    <span className='material-icons'>play_arrow</span>
                                </button>
                            }

                            <button
                                className={`unstyled ${styles.removeBtn}`}
                                onClick={() => removeDownload(download.id)}
                            >
                                <span className='material-icons'>cancel</span>
                            </button>
                        </div>
                    </div>
                    <span className={styles.destinationCategory}>
                        {download.categoryTree.map((folder, index) => `${folder.name} ${index < download.categoryTree.length - 1 ? ' / ' : ''}`)}
                    </span>
                </div>
            })
            : <div className={styles.emptyAlert}>
                <span className="material-icons">all_out</span>
                <span>Nothing here!<br />Why not start some downloads?</span>
            </div>
    }

    const getCompletedDownloads = () => {
        const completedDownloads = currentDownloads.filter(download => download.state === 'complete')
        return completedDownloads.length > 0 ?
            completedDownloads.map(download => {
                return <div
                    className={`
                        ${styles.completedDownload} 
                        ${styles.download}
                    `}
                    key={download.id}
                >
                    <div className={styles.topLine}>
                        <span>{download.name}</span>
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                            <span style={{color: 'var(--fg-color-light', fontSize: '0.75rem'}}>
                                {download.User ? download.User.name : 'Admin'}
                            </span>
                            <button
                                className='unstyled'
                                onClick={() => messageFunctions.addMessage({
                                    title: "Are you sure?",
                                    body: "Are you sure you want to delete this download? All attached files will be deleted!",
                                    onSubmit: () => deleteDownload(download.id)
                                })}
                            >
                                <span className='material-icons'>delete</span>
                            </button>
                        </div>
                    </div>
                    <table className={styles.fileList}>
                        <tbody>
                            {download.File.map(file => {
                                return <tr key={file.id}>
                                    <td>{file.name}</td>
                                    {file.area === 'video' ?
                                        <td className={styles.categoryTree}>
                                            {file.categoryTree.map(treeItem => {
                                                return <span key={treeItem.id}>{treeItem.name}</span>
                                            })}
                                        </td>
                                        : ""
                                    }
                                </tr>
                            })}
                        </tbody>
                    </table>
                </div>
            })
            : <div className={styles.emptyAlert}>
                <span className="material-icons">all_out</span>
                <span>Nothing here!<br />Why not start some downloads?</span>
            </div>
    }

    return <div className={styles.DownloadList}>

        <div className={styles.tabSelector}>
            <button
                className={`
                    secondary
                    ${selectedTab === 'downloading' ? styles.selected : ""}
                `}
                onClick={() => setSelectedTab('downloading')}
            >
                In progress
            </button>
            <button
                className={`
                    secondary
                    ${selectedTab === 'complete' ? styles.selected : ""}
                `}
                onClick={() => setSelectedTab('complete')}
            >
                Completed
            </button>
        </div>

        {currentDownloads.length > 0 ?

            selectedTab === 'downloading' ?
                getInProgressDownloads()
                : getCompletedDownloads()

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
