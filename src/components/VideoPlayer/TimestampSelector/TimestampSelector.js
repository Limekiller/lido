"use client"

import { useEffect, useRef } from 'react';

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

    const getTimestampFromDuration = duration => {
        const hours = (Math.floor(duration / 3600)).toString()
        const minutes = (Math.floor(duration / 60) - (hours * 60)).toString()
        const seconds = Math.round(duration % 60).toString()
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, 0)}`
    }

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
            const timestamp = getTimestampFromDuration(rawTimestamp)
            return <SplideSlide key={i}>
                <button
                    className={`${styles.thumbnail} unstyled`}
                    id={`thumbnail-${i}`}
                    onClick={() => playerRef.current.currentTime(rawTimestamp)}
                >
                    <img src={`/api/video/${fileId}/thumbnail?timestamp=${timestamp}&mime=${mimetype}`} />
                    {timestamp}
                </button>
            </SplideSlide>
        })}
    </Splide>
}

export default TimestampSelector