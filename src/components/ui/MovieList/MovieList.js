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
        const filterDuplicateTitles = movies => {
            return movies.filter((obj, index, self) => 
                index === self.findIndex(o => (
                    o.title === obj.title
                ))
            )
        }

        Promise.resolve(movies).then(async () => {
            if (movies.value) {
                setMoviesState(filterDuplicateTitles(movies.value))
            } else {
                setMoviesState(filterDuplicateTitles(movies))
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
            fixedWidth: '12rem',
            arrows: false,
        }}
    >
        {moviesState.length > 0 ?
            moviesState.map(movie => {
                return <SplideSlide
                    className={styles.movieItem}
                    key={movie.title}
                >
                    <Link href={movie.link ? movie.link : `/browse/${movie.type}/${movie.id}`}>
                        <img src={movie.poster} />
                        <h3>{movie.title}</h3>
                        {movie.addendum ? <p className={styles.addendum}>{movie.addendum}</p> : ""}
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