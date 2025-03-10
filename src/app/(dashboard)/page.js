import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth/auth"
import { getPopularMovies, getPopularShows } from "../api/moviedata/popular/route"
import libFunctions from "@/lib/lib"

import styles from './dashboard.module.scss'
import MovieList from "@/components/ui/MovieList/MovieList"

export default async function Home() {

    const session = await getSession()

    let fullRecentArray, movies, shows

    if (session) {
        const recent = await prisma.WatchLog.findMany({
            where: {
                userId: session.user.id === -1 ? null : session.user.id
            },
            include: {
                File: true
            },
            distinct: ['fileId']
        })
        fullRecentArray = []
        for (let item of recent) {
            const json = JSON.parse(item.File.metadata)
            fullRecentArray.push({
                id: json.id,
                title: (json.title || json.name) || item.File.name,
                poster: json.poster_path ? `https://image.tmdb.org/t/p/w300_and_h450_bestv2/${json.poster_path}` : '/images/lido_no_poster.jpg',
                link: await libFunctions.getCategoryTreeLink(item.File.categoryId)
            })
        }
        fullRecentArray = fullRecentArray.reverse()

        movies = getPopularMovies()
        shows = getPopularShows()
    }

    return <div className={styles.Dashboard}>
        <div className={styles.topBar}>
            <h3>Hey, {session?.user.name}!<br />What do you want to watch?</h3>
            <img src='/images/logo_white.svg' />
        </div>

        {fullRecentArray.length > 0 ?
            <>
                <h1>Recently viewed</h1>
                <MovieList movies={fullRecentArray} />
            </>
            : ""
        }

        <h1>Trending movies</h1>
        <MovieList movies={movies} />

        <h1>Trending shows</h1>
        <MovieList movies={shows} />
    </div>
}
