"use client"

import { useEffect, useState } from 'react'
import styles from './DownloadList.module.scss'

import { get } from '@/lib/actions/downloads'
import InProgressDownloads from './InProgressDownloads/InProgressDownloads'
import CompletedDownloads from './CompletedDownloads/CompletedDownloads'
import EmptyAlert from './EmptyAlert/EmptyAlert'

const DownloadList = ({ downloads, torrents }) => {

    const [fetchStatus, setFetchStatus] = useState(0)
    const [currentDownloads, setCurrentDownloads] = useState(downloads)
    const [currentTorrents, setCurrentTorrents] = useState(torrents)
    const [selectedTab, setSelectedTab] = useState("downloading")

    useEffect(() => {
        let awaiting = false;

        const getDownloads = async () => {
            awaiting = true;
            let downloads = await get()
            setFetchStatus(downloads.result === "success" ? 200 : 0)
            setCurrentDownloads(downloads.data.downloads)
            setCurrentTorrents(downloads.data.torrents)
            awaiting = false;
        }

        let downloadPoll = setInterval(() => {
            if (!awaiting) {
                getDownloads()
            }
        }, 1000)

        return () => {
            clearInterval(downloadPoll)
        }
    }, [])

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
                <InProgressDownloads 
                    currentDownloads={currentDownloads.filter(download => ['downloading', 'paused'].includes(download.state))} 
                    currentTorrents={currentTorrents}
                />
            : 
                <CompletedDownloads completedDownloads={currentDownloads.filter(download => download.state === 'complete')} />
        : 
            <EmptyAlert 
                message={fetchStatus === 0 ? 
                    "Error: the transmission-daemon service is not running."
                :
                    "Nothing here!<br />Why not start some downloads?"
                }
            />
        }
    </div >
}

export default DownloadList
