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
    const [showOverlay, setShowOverlay] = useState(2)
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
        console.log('gig')
        fetch(`/api/user/${session.data.user.id}/file/${fileId}`, {
            method: "POST"
        })
    }

    const keyDownHandler = e => {
        if (showOverlay && e.key !== ' ') return;
        document.querySelector('.vjs-control-bar').classList.add('tv-control')
        const currTime = player.currentTime()
        switch (e.key) {
            case " ":
                e.preventDefault()
                player.paused() ? player.play() : player.pause()
                document.querySelector(`#${styles.playVideo}`).focus()
                break;
            case "ArrowLeft":
                player.currentTime(currTime - 10)
                break;
            case "ArrowRight":
                player.currentTime(currTime + 10)
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
            setPlayer(newPlayer)
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

    // Add a duplicate to the history so we can close the window when going back in the browser
    // without also going back a page
    useEffect(() => {
        recordToWatchLog()
        window.history.pushState(null, "", window.location.href)
        window.addEventListener('popstate', messageFunctions.popMessage)
        return () => {
            window.removeEventListener('popstate', messageFunctions.popMessage)
        }
    }, [])

    return <div
        className={`
            ${styles.VideoPlayer} 
            ${showOverlay ? 'controlbarHidden' : ''}
            ${captionsEnabled ? 'captions' : ''}
            ${player?.textTracks()[0]?.cues_?.length > 0 ? 'captionsAvailable' : ''}
        `}
        onKeyUp={keyDownHandler}
        onMouseMove={() => document.querySelector('.vjs-control-bar').classList.remove('tv-control')}
    >
        <div data-vjs-player>
            <div className={`${styles.overlay} ${showOverlay && !player?.seeking() ? '' : styles.hidden}`}>
                <img alt="Poster for media" src={metadata.Poster} />
                <div className={styles.details}>
                    <h1 style={{ wordBreak: metadata.Title ? 'initial' : 'break-all' }}>
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