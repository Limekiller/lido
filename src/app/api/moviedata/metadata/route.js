import { verifySession } from "@/lib/auth/lib"

export const getFileInfo = async fullTitle => {
    // Get filename if path is absolute
    fullTitle = decodeURI(fullTitle).split('/').slice(-1).join()
    console.log(fullTitle)
    // Remove file extension
    fullTitle = fullTitle.split('.')
    if (fullTitle.length > 1) {
        fullTitle = fullTitle.slice(0, -1).join('.')
    } else {
        fullTitle = fullTitle[0]
    }
    // Split at any four-digit numbers and get first part
    let title = fullTitle.split(/[0-9]{4}/)[0]
    let year = fullTitle.split(title)[1]?.slice(0, 4)

    let season
    let episode

    if (year == '' || year == '1080') {
        title = fullTitle.split(/s[0-9]{2}e[0-9]{2}/i)[0]
        year = ''

        const episodeString = fullTitle.split(title)[1].slice(0, 6).toLowerCase()
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

    return data
}

export const GET = verifySession(
    async req => {
        const searchParams = req.nextUrl.searchParams
        let fullTitle = searchParams.get('title')

        const data = await getFileInfo(fullTitle)

        return Response.json({
            result: "success",
            data: data
        })
    }
)