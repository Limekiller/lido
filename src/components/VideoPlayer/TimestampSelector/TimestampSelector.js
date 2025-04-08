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
    const slider = useRef();
    const numberOfThumbnails = 20

    const [thumbnails, setThumbnails] = useState([])

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
            slider.current.splide.refresh();
        }
        return () => {
            document.removeEventListener('keydown', handleKey)
        }
    }, [slider])

    useEffect(() => {
        if (thumbnails.length === 0 && duration) {
            fetch(`/api/video/${fileId}/thumbnail?duration=${duration}&mime=${mimetype}&number=${numberOfThumbnails}`)
            .then(response => response.json())
            .then(data => setThumbnails(data))
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
                    <img src={thumbnails && thumbnails.length > 0 ? `data:image/jpeg;base64,${thumbnails[i]}` : 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif?20151024034921' } />
                    {timestamp}
                </button>
            </SplideSlide>
        })}
    </Splide>
}

export default TimestampSelector