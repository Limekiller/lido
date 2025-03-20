"use client"

import { useContext, useState } from 'react'
import Link from 'next/link'
import MessageContext from '@/lib/contexts/MessageContext'

import RenameFile from '@/components/ui/RenameFile/RenameFile'
import { renameFile as submitRename } from '@/components/ui/RenameFile/RenameFile'

import styles from './Overlay.module.scss'

const Overlay = ({
    player,
    show,
    metadata,
    fileId,
    name,
    mimetype,
    setShowOverlay
}) => {
    const messageFunctions = useContext(MessageContext)

    const deleteFile = async () => {
        let response = await fetch(`/api/file/${fileId}`, {
            method: "DELETE"
        })
        if (response.status === 200) {
            window.location.reload()
        }
    }

    return <div
        className={`${styles.Overlay} ${styles.overlay} ${show ? '' : styles.hidden}`}
        inert={show ? false : true}
    >
        <img alt="Poster for media" src={`https://image.tmdb.org/t/p/w300_and_h450_bestv2/${metadata.poster_path}`} />
        <div className={styles.details}>
            <h1 style={{ wordBreak: (metadata.name || metadata.title) ? 'initial' : 'break-all' }}>
                {(metadata.episodeData?.name || metadata.title) || name}
            </h1>
            {metadata.episodeData ? 
                <span className={styles.epData}>{metadata.name} • S{metadata.episodeData.season_number}E{metadata.episodeData.episode_number}</span>
            : ""}
            <h2>{metadata.release_date?.slice(0, 4) || metadata.episodeData?.air_date.slice(0, 4)}</h2>
            <p>{metadata.episodeData?.overview || metadata.overview}</p>
            <p style={{ fontSize: '0.75rem', lineHeight: '1rem' }}>
                Film information and subtitles are retrieved based on the filename.<br />
                If this information is not correct, try renaming the file.<br />
                ({name})
            </p>

            <div className={styles.options}>
                <button
                    id='playVideo'
                    className={`unstyled ${styles.playVideo}`}
                    onClick={() => { 
                        player.current.play()
                        setShowOverlay(0) 
                    }}
                >
                    <span className="material-icons">play_circle</span>
                </button>
                <button
                    className={`secondary ${styles.back}`}
                    onClick={messageFunctions.popMessage}
                >
                    <span className="material-icons">arrow_back</span>
                </button>
                <div>
                    <button
                        className={`unstyled ${styles.option}`}
                        onClick={() => messageFunctions.addMessage({
                            title: "Rename file",
                            body: <RenameFile id={fileId} name={name} />,
                            onSubmit: () => submitRename(fileId)
                        })}
                    >
                        <span className="material-icons">border_color</span>
                    </button>
                    <button
                        className={`unstyled ${styles.option}`}
                        onClick={() => messageFunctions.addMessage({
                            title: "Are you sure?",
                            body: "Are you sure you want to delete this movie?",
                            onSubmit: deleteFile
                        })}
                    >
                        <span className="material-icons">delete</span>
                    </button>
                    <button
                        className={`unstyled ${styles.option}`}
                    >
                        <Link href={`/api/video?id=${fileId}&mime=${mimetype}&download=true`}>
                            <span className="material-icons">download</span>
                        </Link>
                    </button>
                </div>
            </div>

        </div>
    </div>
}

export default Overlay