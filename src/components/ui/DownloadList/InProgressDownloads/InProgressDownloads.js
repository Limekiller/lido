"use client"

import { useEffect, useState } from "react"
import Download from "../Download/Download"
import EmptyAlert from "../EmptyAlert/EmptyAlert"

const InProgressDownloads = ({ currentDownloads, currentTorrents }) => {
    const [nonInteractibleDownloads, setNonInteractibleDownloads] = useState({})

    const makeNonInteractable = (id, state) => {
        setNonInteractibleDownloads({ ...nonInteractibleDownloads, [id]: state })
    }

    useEffect(() => {
        const reconcileNonInteractibleDownloads = () => {
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

    return currentDownloads.length > 0 ?
        currentDownloads.map(download => {
            return <Download 
                key={download.id}
                download={download} 
                disabled={Object.keys(nonInteractibleDownloads).includes(download.id)}
                progress={(currentTorrents[download.transmissionId]?.progress * 100).toFixed(2)}
                makeNonInteractable={makeNonInteractable}
            />
        })

    : 
        <EmptyAlert />
}

export default InProgressDownloads