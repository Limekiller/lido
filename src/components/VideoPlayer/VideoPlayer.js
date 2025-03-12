"use client"

import videojs from 'video.js'
import 'video.js/dist/video-js.css'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback, useContext } from 'react'
import MessageContext from '@/lib/contexts/MessageContext'

import styles from './VideoPlayer.module.scss'
import Overlay from './Overlay/Overlay'
import NextVideoTimer from './NextVideoTimer/NextVideoTimer'

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

    const [nextEpisode, setNextEpisode] = useState(null)

    // Used for setting up VideoJS
    const onVideo = useCallback((el) => {
        setPlayerEl(el);
    }, []);

    const keyDownHandler = e => {
        if (document.querySelector('.videoPlayer').classList.contains('showingOverlay') && e.code !== 'Space') return

        document.player.reportUserActivity()
        document.querySelector('.vjs-control-bar').classList.add('tv-control')
        const currTime = document.player.currentTime()

        switch (e.code) {
            case "Space":
                e.preventDefault()
                document.player.paused() ? document.player.play() : document.player.pause()
                document.querySelector(`#playVideo`).focus()
                break;
            case "Enter":
                e.preventDefault()
                const playerClassList = [...document.querySelector('#video').classList]
                const hasJustStarted = playerClassList.slice(-1)[0] !== 'vjs-has-started'
                if (document.player.paused() && !hasJustStarted) break
                document.player.pause()
                document.querySelector(`#playVideo`).focus()
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
                if (newPlayer.seeking()) return
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
            const trackEl = newPlayer.addRemoteTextTrack({ src: `/api/moviedata/subtitles?id=${fileId}` }, false)
            // Captions button doesn't appear unless we do this lol
            setTimeout(() => trackEl.addEventListener('load', () => { newPlayer.pause(); newPlayer.play() }), 5000)

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

        const recordToWatchLog = async () => {
            fetch(`/api/user/${session.data.user.id}/file/${fileId}`, {
                method: "POST"
            })
        }

        getNextEpisode()
        recordToWatchLog()

        // Add a duplicate to the history so we can close the window when going back in the browser
        // without also going back a page
        window.history.pushState(null, "", window.location.href)
        window.addEventListener('popstate', messageFunctions.popMessage)

        // We have to add the listener to the entire document because of the way lido-android works
        document.addEventListener('keydown', keyDownHandler)
        return () => {
            document.removeEventListener('keydown', keyDownHandler)
            window.removeEventListener('popstate', messageFunctions.popMessage)
        }
    }, [])

    return <div
        className={`
            ${styles.VideoPlayer} 
            ${showOverlay ? 'showingOverlay' : ''}
            ${captionsEnabled ? 'captions' : ''}
            ${player?.textTracks()[0]?.cues_?.length > 0 ? 'captionsAvailable' : ''}
            videoPlayer
        `}
        onMouseMove={() => document.querySelector('.vjs-control-bar').classList.remove('tv-control')}
    >
        <div data-vjs-player>
            <NextVideoTimer
                nextEpisode={nextEpisode}
            />

            <Overlay
                show={showOverlay}
                metadata={metadata}
                fileId={fileId}
                name={name}
                mimetype={mimetype}
                setShowOverlay={setShowOverlay}
            />

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
                    // Even though we could set the correct mimetype, it doesn't work?
                    // It only works if we just claim everything is mp4? Um, OKAAAYYY (Tim Robinson voice)
                    type='video/mp4'
                />
            </video>
        </div>
    </div>
}

export default VideoPlayer