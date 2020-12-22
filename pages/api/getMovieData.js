
export default async (req, res) => {

    // Get filename if path is absolute
    let strippedTitle = req.query.title.split('/').slice(-1).join()

    // Remove file extension
    strippedTitle = strippedTitle.split('.').slice(0, -1).join('.')
    
    // Split at any four-digit numbers and get first part
    strippedTitle = strippedTitle.split(/[0-9]{4}/)[0]

    let data = await fetch('https://www.omdbapi.com/?apikey=' + process.env.OMDB_API_KEY + '&t=' + strippedTitle + '&plot=full')

    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    res.end(JSON.stringify(await data.json()))
    
}

