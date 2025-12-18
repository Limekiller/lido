"use server"

export const getPopularMovies = async () => {
    let result = await fetch('https://api.themoviedb.org/3/trending/movie/week', {
        headers: {
            "Authorization": `Bearer ${process.env.TMDB_API_KEY}`
        }
    })
    result = await result.json()
    let finalData = []
    for (const movie of result.results) {
        finalData.push({
            id: movie.id,
            title: movie.title || movie.name,
            type: "movie",
            poster: `https://image.tmdb.org/t/p/w300_and_h450_bestv2/${movie.poster_path}`,
        })
    }

    return finalData
}

export const getPopularShows = async () => {
    let result = await fetch('https://api.themoviedb.org/3/trending/tv/week', {
        headers: {
            "Authorization": `Bearer ${process.env.TMDB_API_KEY}`
        }
    })
    result = await result.json()
    let finalData = []
    for (const movie of result.results) {
        finalData.push({
            id: movie.id,
            title: movie.title || movie.name,
            type: "tv",
            poster: `https://image.tmdb.org/t/p/w300_and_h450_bestv2/${movie.poster_path}`,
        })
    }

    return finalData
}