import { verifySession } from "@/lib/auth/lib"

const getFirstResultByYear = (results, year) => {
    for (const result of results) {
        if (result.release_date && result.release_date.includes(year)) {
            return result
        }
    }
}

export const getFileInfo = async fullTitle => {
    // Get filename if path is absolute
    fullTitle = decodeURI(fullTitle).split('/').slice(-1).join()
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
    }

    // Replace periods with spaces
    title = title.replaceAll('.', ' ')

    let TMDBLink = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(title)}`
    let data = await fetch(TMDBLink, {
        headers: {
            'Authorization': `Bearer ${process.env.TMDB_API_KEY}`
        }
    })

    data = await data.json()

    if (year) {
        data = getFirstResultByYear(data.results, year)
    } else {
        data = data.results[0]
    }

    // If it's an episode, let's also get data for the specific episode
    const seriesId = data.id
    if (season && episode) {
        let episodeData = await fetch(`https://api.themoviedb.org/3/tv/${seriesId}/season/${season}/episode/${episode}`, {
            headers: {
                'Authorization': `Bearer ${process.env.TMDB_API_KEY}`
            }
        })
        episodeData = await episodeData.json()
        data.episodeData = episodeData
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