
export default async (req, res) => {

    const strippedTitle = req.query.title.split('.').slice(0, -1).join('.')
    let data = await fetch('https://www.omdbapi.com/?apikey=' + process.env.OMDB_API_KEY + '&t=' + strippedTitle + '&plot=full')

    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    res.end(JSON.stringify(await data.json()))
    
}

