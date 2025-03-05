"use client"

import videojs from 'video.js'
import 'video.js/dist/video-js.css'

import { useEffect, useState, useCallback, useContext } from 'react'
import MessageContext from '@/lib/MessageContext'

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
            <div className={`${styles.overlay} ${showOverlay ? '' : styles.hidden}`}>
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
                    type={mimetype}
                />
            </video>
        </div>
    </div>
}

export default VideoPlayer