/**
 * Given an IMDB ID of a show, get a list of episodes
 */
export default async (req, res) => {

    const imdbid = req.query.imdbid
    const season = req.query.season

    let data = await fetch(`https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${imdbid}&season=${season}`)
    data = await data.json()

    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    res.end(JSON.stringify(data))
}