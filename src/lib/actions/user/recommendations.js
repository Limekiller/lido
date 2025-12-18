"use server"

import { prisma } from "@/lib/prisma"

export const getRecommendations = async userId => {
    // get history from db
    const watchHistory = await prisma.WatchLog.findMany({
        include: {
            File: true
        },
        where: {
            userId: userId == -1 ? null : userId,
            File: {
                metadata: { not: "{}" }
            }
        },
        orderBy: [{ id: 'desc' }],
        distinct: ['fileId'],
        take: 5
    })

    // For each history item, get a list of similar items
    // Save them to an array along with which item they relate to
    let recArray = []
    let idArray = []
    for (const historyItem of watchHistory) {
        const metadata = JSON.parse(historyItem.File.metadata)
        if (idArray.includes(metadata.id)) {
            continue
        }

        idArray.push(metadata.id)
        let response = await fetch(`https://api.themoviedb.org/3/${metadata.media_type}/${metadata.id}/recommendations`, {
            headers: {
                "Authorization": `Bearer ${process.env.TMDB_API_KEY}`
            }
        })
        response = await response.json()

        // The language filter of the API doesn't actually work, so we have to do it manually
        let processed = 0
        for (const result of response.results) {
            if (result.original_language != 'en') {
                continue
            }
            recArray.push({ rec: result, because: metadata.title || metadata.name })
            processed++
            if (processed >= 5) {
                break
            }
        }
    }

    // Randomize array
    recArray = recArray.reduce(([a, b]) =>
        (b.push(...a.splice(Math.random() * a.length | 0, 1)), [a, b]), [[...recArray], []])[1]

    return recArray
}
