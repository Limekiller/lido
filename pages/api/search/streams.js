import { getSession } from "next-auth/react"

/**
 * Search OMDB for movie data
 */
export default async (req, res) => {

    const session = await getSession({ req })

    if (!session) {
        res.status(401)
        res.end()
    }

    let OMDBLink = `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${req.query.query}`
    let data = await fetch(OMDBLink)
    data = await data.json()

    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    res.end(JSON.stringify(data))
        
}