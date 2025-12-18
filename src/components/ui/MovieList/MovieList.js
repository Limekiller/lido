"use client"

import { useState, useRef, useEffect, useContext, use } from 'react';
import { useSession } from "next-auth/react"
import '@splidejs/react-splide/css';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import Link from 'next/link';

import ContextMenuContext from '@/lib/contexts/ContextMenuContext'
import styles from './MovieList.module.scss'

import { removeFromWatchLog } from '@/lib/actions/user/file';

const MovieList = ({
    movies,
    type = 'popular'
}) => {

    const session = useSession()
    const contextMenuFunctions = useContext(ContextMenuContext)
    const slider = useRef()
    const allMovies = typeof movies?.then === "function" ? use(movies) : movies;

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
        {allMovies.length > 0 ?
            allMovies.map(movie => {
                return <SplideSlide
                    className={styles.movieItem}
                    key={movie.title}
                    onContextMenu={e => {
                        if (type === 'recent') {
                            contextMenuFunctions.showMenu(e, [
                                {
                                    icon: "remove_circle", label: "Remove", function: () => removeFromWatchLog(session.data.user.id, movie.id)
                                },
                            ])
                        }
                    }}
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