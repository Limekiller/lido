
/**
 * Api for retrieving subtitles
 */
export default async (req, res) => {
    // On first request, the IMDB id is sent
    // The server makes a request to OpenSubtitles to get the first search result for that movie
    // Then fetches the data for that result and sends it back to the client for validation.
    if (req.query.imdbid) {

        // First try to get subtitles for this exact file
        let searchResults = []

        if (req.query.filesize !== '0' && req.query.moviehash !== '0') {
            searchResults = await fetch(`
                https://rest.opensubtitles.org/search/imdbid-${req.query.imdbid}/moviebytesize-${req.query.filesize}/moviehash-${req.query.moviehash}/sublanguageid-eng
            `, {
                headers: {
                    'User-Agent': 'TemporaryUserAgent'
                }
            })
            searchResults = await searchResults.json()
        }

        // We didn't find any results? Let's just get the first result for this item
        if (searchResults.length === 0) {
            searchResults = await fetch(`
                https://rest.opensubtitles.org/search/imdbid-${req.query.imdbid}/sublanguageid-eng
            `, {
                headers: {
                    'User-Agent': 'TemporaryUserAgent'
                }
            })
            searchResults = await searchResults.json()
        }

        try {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(JSON.stringify({link: `https://dl.opensubtitles.org/en/download/file/${searchResults[0]['IDSubtitleFile']}`}))
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

