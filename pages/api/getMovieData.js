
export default async (req, res) => {

    let data = await fetch('https://www.omdbapi.com/?apikey=' + process.env.OMDB_API_KEY + '&t=' + req.query.title)

    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    res.end(JSON.stringify(await data.json()))
    
}

