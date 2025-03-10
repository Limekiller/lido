"use client"

import { useState, useRef, useEffect } from 'react';
import '@splidejs/react-splide/css';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import Link from 'next/link';

import styles from './MovieList.module.scss'

const MovieList = ({ movies }) => {
    const slider = useRef();
    const [moviesState, setMoviesState] = useState([])

    useEffect(() => {
        Promise.resolve(movies).then(async () => {
            if (movies.value) {
                setMoviesState(movies.value)
            } else {
                setMoviesState(movies)
            }
        })
    }, [])

    useEffect(() => {
        const handleKey = e => {
            if (e.key === 'ArrowRight') {
                slider.current.splide.go('>')
            } else if (e.key === 'ArrowLeft') {
                slider.current.splide.go('<')
            }
        }

        if (slider.current.splide) {
            slider.current.splide.root.addEventListener('keyup', handleKey)
            slider.current.splide.refresh();
        }

    }, [slider])

    return <Splide
        ref={slider}
        className={styles.MovieList}
        aria-label="Trending movies"
        options={{
            perMove: 1,
            gap: '1rem',
            pagination: false,
            fixedWidth: typeof window !== 'undefined' ? Math.floor(window.innerWidth / 7) : '0px',
            arrows: false,
        }}
    >
        {moviesState.length > 0 ?
            moviesState.map(movie => {
                return <SplideSlide
                    className={styles.movieItem}
                    key={movie.imdbID}
                >
                    <Link href={movie.link ? movie.link : `/browse/${movie.imdbID}`}>
                        <img src={movie.poster !== 'N/A' ? movie.poster : "asdf"} />
                        <h3>{movie.title}</h3>
                    </Link>
                </SplideSlide>
            })
            : new Array(25).fill(0).map((num, index) => {
                return <div
                    key={index}
                    className={`${styles.movieItem} ${styles.loadingPoster}`}
                    style={{
                        animationDelay: `${index / 10}s`
                    }}
                />
            })
        }
    </Splide>
}

export default MovieList