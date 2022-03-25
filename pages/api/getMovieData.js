
export default async (req, res) => {

    // Get filename if path is absolute
    let strippedTitle = decodeURI(req.query.title).split('/').slice(-1).join()

    // Remove file extension
    strippedTitle = strippedTitle.split('.').slice(0, -1).join('.')
    
    // Split at any four-digit numbers and get first part
    let title = strippedTitle.split(/[0-9]{4}/)[0]
    let year = strippedTitle.split(title)[1].slice(0, 4)

    let season
    let episode

    if (year == '') {
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

    let OMDBLink = `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&t=${encodeURI(title)}${year}`
    if (season && episode) {
        OMDBLink += `&season=${season}&episode=${episode}`
    }
    let data = await fetch(OMDBLink)

    // if fetch times out, we'll just sent some empty JSON
    if (data.status === 522) {
        data = {}
    } else {
        data = await data.json()
    }

    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    res.end(JSON.stringify(data))
    
}

