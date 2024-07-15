
/**
 * Api for retrieving subtitles
 */
export default async (req, res) => {

    // On first request, the IMDB id is sent
    // The server makes a request to OpenSubtitles to get the first search result for that movie
    // Then fetches the data for that result and sends it back to the client for validation.
    if (req.query.imdbid) {
        let searchResults = await fetch(`https://api.opensubtitles.com/api/v1/subtitles?imdb_id=${req.query.imdbid}&languages=en&order_by=download_count`, {
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

        try {
            subtitleInfo = await subtitleInfo.json()
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(JSON.stringify(subtitleInfo))
        } catch (error) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 500
            res.end(JSON.stringify({}))
            return
        }
    }

    // On second request, the link is send as a base64-encoded string.
    // The server fetches the subtitles from said link and returns the .vtt file contents
    if (req.query.link) {
        let subtitles = await fetch(req.query.link)
        subtitles = await subtitles.text()
        res.setHeader('Content-Type', 'text/plain')
        res.statusCode = 200
        res.end(subtitles)
    }

}

