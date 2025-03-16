import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth/auth"
import { getPopularMovies, getPopularShows } from "../api/moviedata/popular/route"
import { getRecommendations } from "../api/user/[id]/recommendations/route"
import libFunctions from "@/lib/lib"

import styles from './dashboard.module.scss'
import MovieList from "@/components/ui/MovieList/MovieList"

export default async function Home() {

    const session = await getSession()

    let fullRecentArray, movies, shows, fullRecommendedArray

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
                id: item.fileId,
                title: (json.title || json.name) || item.File.name,
                poster: json.poster_path ? `https://image.tmdb.org/t/p/w300_and_h450_bestv2/${json.poster_path}` : '/images/lido_no_poster.jpg',
                link: await libFunctions.getCategoryTreeLink(item.File.categoryId),
                type: json.media_type
            })
        }
        fullRecentArray = fullRecentArray.reverse()

        fullRecommendedArray = []
        const recommendations = await getRecommendations(session.user.id)
        for (let item of recommendations) {
            fullRecommendedArray.push({
                id: item.rec.id,
                title: (item.rec.title || item.rec.name),
                poster: `https://image.tmdb.org/t/p/w300_and_h450_bestv2/${item.rec.poster_path}`,
                addendum: `Because you watched ${item.because}`,
                type: item.rec.media_type
            })
        }

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
                <MovieList movies={fullRecentArray} type='recent' />
            </>
            : ""
        }

        <h1>Recommended for you</h1>
        <MovieList movies={fullRecommendedArray} />

        <h1>Trending movies</h1>
        <MovieList movies={movies} />

        <h1>Trending shows</h1>
        <MovieList movies={shows} />
    </div>
}
