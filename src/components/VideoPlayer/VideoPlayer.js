"use client"

import videojs from 'video.js'
import 'video.js/dist/video-js.css'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useRef, useContext, useCallback } from 'react'
import MessageContext from '@/lib/contexts/MessageContext'
import ToastContext from '@/lib/contexts/ToastContext'

import styles from './VideoPlayer.module.scss'
import Overlay from './Overlay/Overlay'
import NextVideoTimer from './NextVideoTimer/NextVideoTimer'
import TimestampSelector from './TimestampSelector/TimestampSelector'

import { addToWatchLog } from '@/lib/actions/user/file'

const VideoPlayer = ({
    fileId,
    mimetype,
    metadata,
    name,

    partyModeActive = false,
    roomId,
    partyListeners,
    lastAction,
    chatOpen = false
}) => {
    const session = useSession()
    const messageFunctions = useContext(MessageContext)
    const toastFunctions = useContext(ToastContext)
    const playerRef = useRef(null)

    const [playerEl, setPlayerEl] = useState(null)
    const [showOverlay, setShowOverlay] = useState(true)
    const [captionsEnabled, setCaptionsEnabled] = useState(false)
    const [captionsAvailable, setCaptionsAvailable] = useState(false)
    const [nextEpisode, setNextEpisode] = useState(null)
    const [thumbnailsActive, setthumbnailsActive] = useState(false)

    // Used to initialize player
    const onVideo = useCallback((el) => {
        setPlayerEl(el);
    }, []);

    const keyDownHandler = e => {
        if (document.querySelector('.videoPlayer').classList.contains('showingOverlay') && e.code !== 'Space') return
        if (document.activeElement.tagName === 'INPUT') return

        playerRef.current.reportUserActivity()
        document.querySelector('.vjs-control-bar').classList.add('tv-control')
        const currTime = playerRef.current.currentTime()

        switch (e.code) {
            case "Space":
                e.preventDefault()
                playerRef.current.paused() ? playerRef.current.play() : playerRef.current.pause()
                document.querySelector(`#playVideo`).focus()
                break;

            case "Enter":
                const playerClassList = [...document.querySelector('#video').classList]
                const hasJustStarted = playerClassList.slice(-1)[0] !== 'vjs-has-started'
                if (
                    (playerRef.current.paused() && !hasJustStarted) ||
                    document.querySelector('.timestampSelector').classList.contains('active')
                ) break
                e.preventDefault()
                playerRef.current.pause()
                document.querySelector(`#playVideo`).focus()
                break;

            case "ArrowUp":
                setthumbnailsActive(true)
                break;

            case "ArrowDown":
                if (document.querySelector('.timestampSelector').classList.contains('active')) {
                    setthumbnailsActive(false)
                } else {
                    toastFunctions.createToast({
                        message: "Subtitles toggled"
                    })
                    setSubtitles(e)
                }
                break;

            case "ArrowLeft":
                if (document.querySelector('.timestampSelector').classList.contains('active')) break;
                playerRef.current.currentTime(currTime - (playerRef.current.duration() / 50))
                break;

            case "ArrowRight":
                if (document.querySelector('.timestampSelector').classList.contains('active')) break;
                playerRef.current.currentTime(currTime + (playerRef.current.duration() / 50))
                break;

            default:
                break;
        }
    }

    const setSubtitles = e => {
        e.preventDefault()
        if (playerRef.current.textTracks()[0].mode === 'hidden' || playerRef.current.textTracks()[0].mode === 'disabled') {
            setCaptionsEnabled(true)
            playerRef.current.textTracks()[0].mode = 'showing'
        } else {
            setCaptionsEnabled(false)
            playerRef.current.textTracks()[0].mode = 'hidden'
        }
    }

    useEffect(() => {
        if (!playerRef.current) {
            if (playerEl == null) return
            const player = playerRef.current = videojs(playerEl, {})
            player.ready(() => {
                player.play()

                player.on('pause', () => {
                    if (player.seeking()) return
                    setthumbnailsActive(false)
                    setShowOverlay(1)
                    if (partyListeners) {
                        partyListeners.pause()
                    }
                })

                player.on('play', () => {
                    // EXTREMELY hacky way to detect if this is the "first play" or not
                    // We want to bind the overlay to the play state in every case except for autoplaying at the beginning
                    // If "vjs-has-started" is the most recent class in the video's class list, this is the first time it started playing,
                    // so don't hide the overlay
                    const playerClassList = [...document.querySelector('#video').classList]
                    if (playerClassList.slice(-1)[0] !== 'vjs-has-started') {
                        setShowOverlay(0)
                    }
                    if (partyListeners) {
                        partyListeners.play()
                    }
                })

                player.on('seeked', () => {
                    if (partyListeners) {
                        partyListeners.seek(player.currentTime())
                    }
                })

                const trackEl = player.addRemoteTextTrack({ src: `/api/moviedata/subtitles?id=${fileId}` }, false)
                // VideoJS is full of fun surprises :) Why doesn't the captions button work right on mobile?
                // No one knows! Let's duplicate it to remove all event listeners and bind our own function to it, I guess!
                trackEl.addEventListener('load', () => {
                    if (player.textTracks()[0]?.cues_?.length) {
                        setCaptionsAvailable(true)
                    }
                    const old_elem = document.querySelector('button.vjs-subs-caps-button')
                    const new_elem = old_elem.cloneNode(true)
                    old_elem.parentNode.replaceChild(new_elem, old_elem)
                    document.querySelector('button.vjs-subs-caps-button').addEventListener('click', setSubtitles)
                })
            })
        }
    }, [playerEl])

    // Set focus to play button when the overlay appears
    useEffect(() => {
        if (showOverlay) document.querySelector(`#playVideo`)?.focus()
    }, [showOverlay])

    useEffect(() => {
        const getNextEpisode = async () => {
            let download = await fetch(`/api/file/${fileId}/download`)
            download = await download.json()
            download = download.data

            let nextFile = null
            for (let i = 0; i < download['File']?.length; i++) {
                if (download['File'][i].id === fileId) {
                    nextFile = download['File']?.[i + 1]
                    break
                }
            }

            if (nextFile) setNextEpisode(nextFile)
        }

        getNextEpisode()
        addToWatchLog(session.data.user.id, fileId)

        // Add a duplicate to the history so we can close the window when going back in the browser
        // without also going back a page
        window.history.pushState(null, "", window.location.href)
        window.addEventListener('popstate', messageFunctions.popMessage)

        // We have to add the listener to the entire document because of the way lido-android works
        document.addEventListener('keydown', keyDownHandler)

        SpatialNavigation.disable('add')
        document.body.classList.add('videoPlaying')

        return () => {
            if (playerRef?.current) {
                playerRef.current.dispose()
            }
            document.removeEventListener('keydown', keyDownHandler)
            window.removeEventListener('popstate', messageFunctions.popMessage)
            SpatialNavigation.enable('add')
            document.body.classList.remove('videoPlaying')
        }
    }, [])

    useEffect(() => {
        switch (lastAction?.action) {
            case "play":
                playerRef.current.play()
                setShowOverlay(false)
                break;
            case "pause":
                playerRef.current.pause()
                break;
            case "seek":
                if (lastAction.args?.seekTime) {
                    playerRef.current.currentTime(lastAction.args.seekTime)
                } else {
                    if (!playerRef.current.paused()) partyListeners.play()
                    partyListeners.seek(playerRef.current.currentTime())
                }

            default:
                break;
        }
    }, [lastAction])

    return <div
        className={`
            ${styles.VideoPlayer} 
            ${partyModeActive ? 'partyModeActive' : ''}
            ${showOverlay ? 'showingOverlay' : ''}
            ${captionsEnabled ? 'captions' : ''}
            ${captionsAvailable ? 'captionsAvailable' : ''}
            ${thumbnailsActive ? 'thumbnailsActive' : ''}
            videoPlayer
        `}
        onMouseMove={() => document.querySelector('.vjs-control-bar').classList.remove('tv-control')}
    >
        <div data-vjs-player style={{ width: chatOpen ? 'calc(100vw - 270px)' : '100vw' }}>
            <NextVideoTimer
                player={playerRef}
                nextEpisode={nextEpisode}
            />

            <Overlay
                player={playerRef}
                show={showOverlay}
                metadata={metadata}
                fileId={fileId}
                name={name}
                partyModeActive={partyModeActive}
                mimetype={mimetype}
                setShowOverlay={setShowOverlay}
            />

            <TimestampSelector
                mimetype={mimetype}
                fileId={fileId}
                duration={playerRef?.current?.duration()}
                playerRef={playerRef}
                active={thumbnailsActive}
            />

            <video
                className='video-js'
                preload="auto"
                id='video'
                controls
                autoPlay={partyModeActive ? false : true}
                ref={onVideo}
                crossOrigin="anonymous"
            >
                <source
                    src={`/api/video/${fileId}?mime=${mimetype}` + (roomId ? `&room=${roomId}` : "")}
                    // Even though we could set the correct mimetype, it doesn't work?
                    // It only works if we just claim everything is mp4? Um, OKAAAYYY (Tim Robinson voice)
                    type='video/mp4'
                />
            </video>
        </div>
    </div>
}

export default VideoPlayer