"use client"

import { useEffect, useRef, useState } from 'react';
import { clientLibFunctions } from '@/lib/client/lib';

import '@splidejs/react-splide/css';
import { Splide, SplideSlide } from '@splidejs/react-splide';

import styles from './TimestampSelector.module.scss'

const TimestampSelector = ({
    mimetype,
    fileId,
    duration,
    playerRef,
    active = false
}) => {
    const [thumbnails, setThumbnails] = useState([])

    const numberOfThumbnails = 20
    const slider = useRef()
    const thumbnailRef = useRef()
    thumbnailRef.current = thumbnails

    useEffect(() => {
        const handleKey = e => {
            if (document.activeElement.closest('.splide')?.id !== slider.current.splideRef.current.id) return

            if (e.code === 'ArrowRight') {
                slider.current.splide.go('>')
            } else if (e.code === 'ArrowLeft') {
                slider.current.splide.go('<')
            }
        }
        if (slider.current.splide) {
            document.addEventListener('keydown', handleKey)
        }
        return () => {
            document.removeEventListener('keydown', handleKey)
        }
    }, [slider])

    useEffect(() => {
        if (thumbnails.length === 0 && duration) {
            const getThumbnails = async () => {
                const numIters = Math.ceil(numberOfThumbnails / 3)
                for (let i = 0; i < numIters + 1; i++) {
                    let response = await fetch(
                        `/api/video/${fileId}/thumbnail?duration=${duration}&mime=${mimetype}&number=${numberOfThumbnails}&start=${i * 3}&end=${(i * 3) + 2}`,
                        {signal: AbortSignal.timeout(10000)}
                    )
                    response = await response.json()
                    setThumbnails([...thumbnailRef.current, ...response])
                }
            }
            getThumbnails()
        }

        if (!active) return
        const currIndex = Math.floor(playerRef.current.currentTime() / (duration / numberOfThumbnails))
        slider.current.splide.go(currIndex - 3)
        setTimeout(() => document.querySelector(`#thumbnail-${currIndex}`).focus(), 200)
    }, [active])
    
    return <Splide
        ref={slider}
        aria-label="Thumbnails"
        className={`
            timestampSelector
            ${styles.TimestampSelector}
            ${active ? `${styles.active} active` : ''}
        `}
        options={{
            perMove: 1,
            gap: '1rem',
            pagination: false,
            fixedWidth: '12rem',
            arrows: false,
        }}
        inert={!active}
    >
        {[...Array(numberOfThumbnails).keys()].map(i => {
            const rawTimestamp = (duration / numberOfThumbnails) * i
            const timestamp = clientLibFunctions.getTimestampFromDuration(rawTimestamp)
            return <SplideSlide key={i}>
                <button
                    className={`${styles.thumbnail} unstyled`}
                    id={`thumbnail-${i}`}
                    onClick={() => playerRef.current.currentTime(rawTimestamp)}
                >
                    <img src={thumbnails[i] ? `data:image/jpeg;base64,${thumbnails[i]}` : 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif?20151024034921' } />
                    {timestamp}
                </button>
            </SplideSlide>
        })}
    </Splide>
}

export default TimestampSelector