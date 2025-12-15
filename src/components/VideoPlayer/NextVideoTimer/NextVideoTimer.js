"use client"

import { useState, useEffect, useContext } from 'react'
import MessageContext from '@/lib/contexts/MessageContext'

import VideoPlayer from '../VideoPlayer'
import styles from './NextVideoTimer.module.scss'

const NextVideoTimer = ({
    player,
    nextEpisode
}) => {
    const messageFunctions = useContext(MessageContext)

    const [show, setShow] = useState(false)
    const [userInput, setUserInput] = useState(false)

    useEffect(() => {
        const reportUserActivity = () => {
            if (player.current.duration() - player.current.currentTime() < 40) {
                setUserInput(true)
                setShow(false)
            }
        }

        const timeLeftChecker = e => {
            if (!nextEpisode || userInput || !player.current.duration()) return

            if (player.current.duration() - player.current.currentTime() > 40) return
            setShow(true)

            if (player.current.duration() - player.current.currentTime() > 30) return
            clearInterval(nextEpChecker)
            
            messageFunctions.replaceMessage({
                title: nextEpisode.name,
                body: <VideoPlayer
                    fileId={nextEpisode.id}
                    name={nextEpisode.name}
                    mimetype={nextEpisode.mimetype}
                    metadata={JSON.parse(nextEpisode.metadata)}
                />,
                hideBoilerplate: true
            })
            setTimeout(() => document.querySelector(`#playVideo`).click(), 5000)
        }
        document.addEventListener('mousemove', reportUserActivity)
        document.addEventListener('keydown', reportUserActivity)
        const nextEpChecker = setInterval(timeLeftChecker, 2000)
        return () => {
            clearInterval(nextEpChecker)
            document.removeEventListener('mousemove', reportUserActivity)
            document.removeEventListener('keydown', reportUserActivity)
        }
    }, [nextEpisode, userInput])

    return nextEpisode && show ? <div className={`${styles.NextVideoTimer}`}>
        <span><b>Up next:</b> {
            JSON.parse(nextEpisode.metadata).episodeData ?
                `S${JSON.parse(nextEpisode.metadata).episodeData.season_number}E${JSON.parse(nextEpisode.metadata).episodeData.episode_number} ${JSON.parse(nextEpisode.metadata).episodeData.name}` :
                JSON.parse(nextEpisode.metadata).name || nextEpisode.name
        }
        </span>
        <div className={styles.timer}></div>
    </div>
        : ""
}

export default NextVideoTimer