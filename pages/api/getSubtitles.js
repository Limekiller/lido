
export default async (req, res) => {

    let searchResults = await fetch(`https://api.opensubtitles.com/api/v1/subtitles?imdb_id=${req.query.imdbid}?languages=en`, {
        headers: {
            'Api-Key': process.env.OPENSUBTITLES_API_KEY,
            'Content-Type': 'application/json'
        }
    })
    searchResults = await searchResults.json()

    let subtitleInfo = await fetch('https://api.opensubtitles.com/api/v1/download', {
        method: 'POST',
        headers: {
            'Api-Key': process.env.OPENSUBTITLES_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'file_id': searchResults.data[0].attributes.files[0].file_id,
            'sub_format': 'webvtt'
        })
    })

    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    res.end(JSON.stringify(await subtitleInfo.json()))
    
}

