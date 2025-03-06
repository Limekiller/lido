"use client"

import videojs from 'video.js'
import 'video.js/dist/video-js.css'

import { useEffect, useState, useCallback, useContext } from 'react'
import Link from 'next/link'
import MessageContext from '@/lib/contexts/MessageContext'

import RenameFile from '@/components/ui/RenameFile/RenameFile'
import { renameFile as submitRename } from '@/components/ui/RenameFile/RenameFile'

import styles from './VideoPlayer.module.scss'

const VideoPlayer = ({
    fileId,
    mimetype,
    metadata,
    name
}) => {
    const messageFunctions = useContext(MessageContext)

    const [playerEl, setPlayerEl] = useState(null)
    const [player, setPlayer] = useState(null)
    const [showOverlay, setShowOverlay] = useState(true)

    const onVideo = useCallback((el) => {
        setPlayerEl(el);
    }, []);

    const keyDownHandler = e => {
        if (e.code === 'Space') {
            if (player.paused()) {
                player.play()
            } else {
                player.pause()
            }
        }
    }

    const deleteFile = async () => {
        let response = await fetch(`/api/file/${fileId}`, {
            method: "DELETE"
        })
        if (response.status === 200) {
            window.location.reload()
        }
    }

    // Initialize player
    useEffect(() => {
        if (playerEl == null) return;

        const newPlayer = videojs(playerEl, {})
        newPlayer.on('pause', () => {
            setShowOverlay(true)
        })
        newPlayer.on('play', () => {
            setShowOverlay(false)
        })
        setPlayer(newPlayer)

        return () => {
            document.removeEventListener('keydown', keyDownHandler)
            newPlayer.dispose();
        }
    }, [playerEl])

    // Initialize effects once player is mounted
    useEffect(() => {
        document.addEventListener('keydown', keyDownHandler)
        return () => {
            document.removeEventListener('keydown', keyDownHandler)
        }
    }, [player])


    return <div className={`${styles.VideoPlayer} ${showOverlay ? 'controlbarHidden' : ''}`}>
        <div data-vjs-player>
            <div className={`${styles.overlay} ${showOverlay && !player?.seeking() ? '' : styles.hidden}`}>
                <img src={metadata.Poster} />
                <div className={styles.details}>
                    <h1 style={{wordBreak: metadata.Title ? 'initial' : 'break-all'}}>
                        {metadata.Title || name}
                    </h1>
                    <h2>{metadata.Year}</h2>
                    <p>{metadata.Plot}</p>
                    <p style={{ fontSize: '0.75rem', lineHeight: '1rem' }}>
                        Film information and subtitles are retrieved based on the filename.<br />
                        If this information is not correct, try renaming the file.<br />
                        ({name})
                    </p>
                    <div className={styles.options}>
                        <button className='unstyled' onClick={() => player.play()}>
                            <span id={styles.playVideo} className="material-icons">play_circle</span>
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
                                    body: <RenameFile id={fileId} />,
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

            <video
                className='video-js'
                preload="auto"
                id='video'
                controls
                autoPlay='autoplay'
                ref={onVideo}
                //autoPlay={this.props.partyMode ? '' : 'autoplay'}
                crossOrigin="anonymous"
            >
                <source
                    // src={this.props.stream ? `/api/video?range=0&stream=1&magnet=${this.props.magnet}` 
                    //     : '/api/video?range=0&path=' + encodeURIComponent(this.props.path)
                    // } 
                    src={`/api/video?id=${fileId}&mime=${mimetype}`}
                    // Even though we have the correct mimetype, it doesn't work?
                    // It only works if we just claim everything is mp4? Um, OKAAAYYY (Tim Robinson voice)
                    type='video/mp4' 
                />
            </video>
        </div>
    </div>
}

export default VideoPlayer