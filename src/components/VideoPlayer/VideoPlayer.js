"use client"

import videojs from 'video.js'
import 'video.js/dist/video-js.css'

import { useSession } from 'next-auth/react'
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
    const session = useSession()
    const messageFunctions = useContext(MessageContext)

    const [playerEl, setPlayerEl] = useState(null)
    const [player, setPlayer] = useState(null)
    const [showOverlay, setShowOverlay] = useState(true)
    const [captionsEnabled, setCaptionsEnabled] = useState(false)

    const onVideo = useCallback((el) => {
        setPlayerEl(el);
    }, []);

    const deleteFile = async () => {
        let response = await fetch(`/api/file/${fileId}`, {
            method: "DELETE"
        })
        if (response.status === 200) {
            window.location.reload()
        }
    }

    const recordToWatchLog = async () => {
        fetch(`/api/user/${session.data.user.id}/file/${fileId}`, {
            method: "POST"
        })
    }

    const keyDownHandler = e => {
        if (document.querySelector('.videoPlayer').classList.contains('showingOverlay') && e.code !== 'Space') return

        document.player.reportUserActivity()
        document.querySelector('.vjs-control-bar').classList.add('tv-control')
        const currTime = document.player.currentTime()

        switch (e.code) {
            case "Space":
                e.preventDefault()
                document.player.paused() ? document.player.play() : document.player.pause()
                document.querySelector(`#${styles.playVideo}`).focus()
                break;
            case "Enter":
                e.preventDefault()
                const playerClassList = [...document.querySelector('#video').classList]
                const hasJustStarted = playerClassList.slice(-1)[0] !== 'vjs-has-started'
                if (document.player.paused() && !hasJustStarted) break
                document.player.pause()
                document.querySelector(`#${styles.playVideo}`).focus()
                break;
            case "ArrowLeft":
                document.player.currentTime(currTime - 10)
                break;
            case "ArrowRight":
                document.player.currentTime(currTime + 10)
                break;
            default:
                break;
        }
    }

    // Initialize player
    useEffect(() => {
        if (playerEl == null) return;
        const newPlayer = videojs(playerEl, {})
        newPlayer.ready(() => {
            newPlayer.on('pause', () => {
                setShowOverlay(1)
            })
            newPlayer.on('play', () => {
                // EXTREMELY hacky way to detect if this is the "first play" or not
                // We want to bind the overlay to the play state in every case except for autoplaying at the beginning
                // If "vjs-has-started" is the most recent class in the video's class list, this is the first time it started playing,
                // so don't hide the overlay
                const playerClassList = [...document.querySelector('#video').classList]
                if (playerClassList.slice(-1)[0] !== 'vjs-has-started') {
                    setShowOverlay(0)
                }
            })
            newPlayer.addRemoteTextTrack({ src: `/api/moviedata/subtitles?id=${fileId}` }, false)

            // Make the player available to both react and the DOM
            setPlayer(newPlayer)
            document.player = newPlayer
            document.player.play()
        })

        return () => {
            newPlayer.dispose();
        }
    }, [playerEl])

    // Initialize effects once player is mounted
    useEffect(() => {
        const setSubtitles = () => {
            player.textTracks()[0].mode = 'hidden'
            if (!captionsEnabled) {
                player.textTracks()[0].mode = 'showing'
            }
            setCaptionsEnabled(!captionsEnabled)
        }

        SpatialNavigation.disable('add')
        document.body.classList.add('videoPlaying')
        document.querySelector('.vjs-subs-caps-button')?.addEventListener('click', setSubtitles)
        return () => {
            SpatialNavigation.enable('add')
            document.body.classList.remove('videoPlaying')
        }
    }, [player, captionsEnabled])

    useEffect(() => {
        if (showOverlay) document.querySelector(`#${styles.playVideo}`)?.focus()
    }, [showOverlay])
    
    // Add a duplicate to the history so we can close the window when going back in the browser
    // without also going back a page
    useEffect(() => {
        recordToWatchLog()
        document.addEventListener('keydown', keyDownHandler)
        window.history.pushState(null, "", window.location.href)
        window.addEventListener('popstate', messageFunctions.popMessage)
        return () => {
            document.removeEventListener('keydown', keyDownHandler)
            window.removeEventListener('popstate', messageFunctions.popMessage)
        }
    }, [])

    return <div
        className={`
            ${styles.VideoPlayer} 
            ${showOverlay ? 'controlbarHidden showingOverlay' : ''}
            ${captionsEnabled ? 'captions' : ''}
            ${player?.textTracks()[0]?.cues_?.length > 0 ? 'captionsAvailable' : ''}
            videoPlayer
        `}
        onMouseMove={() => document.querySelector('.vjs-control-bar').classList.remove('tv-control')}
    >
        <div data-vjs-player>
            <div 
                className={`${styles.overlay} ${showOverlay && !player?.seeking() ? '' : styles.hidden}`}
                inert={showOverlay ? false : true}
            >
                <img alt="Poster for media" src={`https://image.tmdb.org/t/p/w300_and_h450_bestv2/${metadata.poster_path}`} />
                <div className={styles.details}>
                    <h1 style={{ wordBreak: (metadata.name || metadata.title) ? 'initial' : 'break-all' }}>
                        {(metadata.name || metadata.title) || name}
                    </h1>
                    <h2>{metadata.release_date}</h2>
                    <p>{metadata.overview}</p>
                    <p style={{ fontSize: '0.75rem', lineHeight: '1rem' }}>
                        Film information and subtitles are retrieved based on the filename.<br />
                        If this information is not correct, try renaming the file.<br />
                        ({name})
                    </p>

                    <div className={styles.options}>
                        <button
                            id={styles.playVideo}
                            className='unstyled'
                            onClick={() => { player.play(); setShowOverlay(0) }}
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