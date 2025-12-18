"use client"

import { useState, useEffect } from 'react'
import styles from './PosterBg.module.scss'

import { get } from '@/lib/actions/moviedata/poster'

const PosterBg = () => {
    const [numCols, setNumCols] = useState(9)
    const [numRows, setNumRows] = useState(4)
    const [offset, setOffset] = useState(17)
    const [time, setTime] = useState(120)

    useEffect(() => {
      setNumCols(window.innerWidth / (window.innerHeight / 4.5))
      setOffset(Math.round(window.innerHeight / 10) / 4)
      setTime(Math.round(window.innerHeight / 10))

      window.setTimeout(() => {
        const numPosters = document.querySelectorAll('.' + styles.poster).length;
        get(numPosters)
        .then(response => {
            document.querySelectorAll('.' + styles.poster).forEach((poster, i) => {
                // Load the image into a new element so we can use a load listener to know when to make the poster opaque
                const src = `/images/posters/${response[i]}`
                const img = new Image();
                img.addEventListener('load', () => {
                    poster.style.opacity = 1;
                    poster.style.backgroundImage = 'url("/images/posters/' + response[i] + '")'
                })
                img.src = src;
            })
        })
      }, 500)
      return () => {
        second
      }
    }, [])

    const content = () => {
        let content = [];
        for (let i = 0; i < numCols; i++) {
            let innerContent = []
            const reverse = i % 2 == 0 ? '' : 'reverse'
            for (let j = 0; j < numRows; j++) {
                innerContent.push(<div key={j} className={styles.poster} style={{ animation: styles.posterUp + ' ' + time + 's -' + (j * offset) + 's linear ' + reverse + ' infinite' }} />);
            }
            content.push(<div key={i} className={styles.posterTrack}>{innerContent}</div>)
        }
        return content
    }

    return <div className={styles.loginBg}>
        {content()}
    </div>
}

export default PosterBg