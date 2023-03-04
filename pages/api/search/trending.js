import { getSession } from "next-auth/react"
import jsdom from 'jsdom'

/**
 * Scrape IMDB for trending movies + shows
 */
export default async (req, res) => {

    const session = await getSession({ req })

    if (!session) {
        res.status(401)
        res.end()
    }

    let html = await fetch('https://www.imdb.com/chart/moviemeter/')
    html = await html.text()
    let dom = new jsdom.JSDOM(html)

    let movieResults = [];
    const movies = dom.window.document.querySelectorAll('.titleColumn a')
    for (let i = 0; i < 6; i++) {
        const imdbID = movies[i].href.split('/')[2]
        let fullData = await fetch(`https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${imdbID}`)
        fullData = await fullData.json()

        movieResults.push({
            title: movies[i].textContent, 
            imdbID: imdbID, 
            poster: fullData.Poster 
        })
    }

    html = await fetch('https://www.imdb.com/chart/tvmeter/')
    html = await html.text()
    dom = new jsdom.JSDOM(html)

    let tvResults = [];
    const shows = dom.window.document.querySelectorAll('.titleColumn a')
    for (let i = 0; i < 6; i++) {
        const imdbID = shows[i].href.split('/')[2]
        let fullData = await fetch(`https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${imdbID}`)
        fullData = await fullData.json()

        tvResults.push({
            title: shows[i].textContent, 
            imdbID: imdbID, 
            poster: fullData.Poster 
        })
    }

    res.statusCode = 200
    res.end(JSON.stringify({movies: movieResults, shows: tvResults}))
}