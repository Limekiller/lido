
/**
 * Get the full OMDB data for some media
 * This is expected to be a file path, but it doesn't have to be
 */
export default async (req, res) => {

    // Get filename if path is absolute
    let strippedTitle = decodeURI(req.query.title).split('/').slice(-1).join()

    // Remove file extension
    strippedTitle = strippedTitle.split('.').slice(0, -1).join('.')
    
    // Split at any four-digit numbers and get first part
    let title = strippedTitle.split(/[0-9]{4}/)[0]
    let year = strippedTitle.split(title)[1]?.slice(0, 4)

    let season
    let episode

    if (year == '' || year == '1080') {
        title = strippedTitle.split(/s[0-9]{2}e[0-9]{2}/i)[0]
        year = ''

        const episodeString = strippedTitle.split(title)[1].slice(0, 6).toLowerCase()
        if (episodeString) {
            season = episodeString.split('e')[0].slice(1, 3)
            episode = episodeString.split('e')[1]
        }
    } else {
        year = `&y=${year}`
    }

    let OMDBLink = `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&t=${encodeURIComponent(title)}${year}`
    if (season && episode) {
        OMDBLink += `&season=${season}&episode=${episode}`
    }
    let data = await fetch(OMDBLink)

    // if fetch times out, we'll just sent some empty JSON
    if (data.status === 522) {
        data = {}
    } else {
        data = await data.json()

        // If it's an episode, let's also get data for the series it belongs to
        if (data.Type == 'episode') {
            // apparently sometimes the series ID that the API returns only starts with one "t" instead of two "t"s
            // and in this case, making a request for the series causes a server error!!! Fun!!!!!!
            // So we check if this is the case and, if it is, prepend another "t" to the ID to fix this.
            let seriesId = data.seriesID
            if (seriesId.slice(0, 2) !== 'tt') {
                seriesId = `t${seriesId}`
            }
            
            let seriesData = await fetch(`https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${seriesId}`)
            seriesData = await seriesData.json()
            data.seriesData = seriesData
        }
    }

    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    res.end(JSON.stringify(data))
    
}

