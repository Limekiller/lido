import { verifySession } from '@/lib/auth/lib'
import jsdom from 'jsdom'

export const getPopularMovies = async () => {
    let html = await fetch('https://www.imdb.com/chart/moviemeter/')
    html = await html.text()
    let dom = new jsdom.JSDOM(html)

    let movieResults = [];
    const movies = dom.window.document.querySelectorAll('a.ipc-title-link-wrapper')
    for (let i = 0; i < 25; i++) {
        const imdbID = movies[i].href.split('/')[2]
        let fullData = await fetch(`https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${imdbID}`)
        fullData = await fullData.json()

        movieResults.push({
            title: movies[i].textContent, 
            imdbID: imdbID, 
            poster: fullData.Poster 
        })
    }

    return movieResults
}

export const getPopularShows = async () => {
    let html = await fetch('https://www.imdb.com/chart/tvmeter/')
    html = await html.text()
    let dom = new jsdom.JSDOM(html)

    let tvResults = [];
    const shows = dom.window.document.querySelectorAll('a.ipc-title-link-wrapper')
    for (let i = 0; i < 25; i++) {
        const imdbID = shows[i].href.split('/')[2]
        let fullData = await fetch(`https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${imdbID}`)
        fullData = await fullData.json()

        tvResults.push({
            title: shows[i].textContent, 
            imdbID: imdbID, 
            poster: fullData.Poster 
        })
    }

    return tvResults
}

export const GET = verifySession(
    async req => {
        
        const movieResults = await getPopularMovies()
        const tvResults = await getPopularShows()

        return Response.json({
            result: 'success',
            data: {
                movies: movieResults,
                tv: tvResults
            }
        })
    }
)