import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth/auth"
import { verifySession, verifyUserResource } from '@/lib/auth/lib'

export const GET = verifySession(
    async (req, { params }) => {
        const id = (await params).id

        if (!verifyUserResource(req, id)) {
            return Response.json({
                result: "error",
                data: {
                    message: "Unauthorized"
                }
            }, { status: 401 })
        }

        // get history from db
        const watchHistory = await prisma.WatchLog.findMany({
            include: {
                File: true
            },
            where: {
                userId: id === '-1' ? null : id,
                File: {
                    metadata: { not: "{}" }
                }
            },
            distinct: ['fileId']
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
            // let response = await fetch(`https://api.themoviedb.org/3/${metadata.media_type}/${metadata.id}/similar?language=en`, {
            //     headers: {
            //         "Authorization": `Bearer ${process.env.TMDB_API_KEY}`
            //     }
            // })
            let response = await fetch(`https://api.themoviedb.org/3/discover/${metadata.media_type}?with_genres=${metadata.genre_ids.join(',')}&with_origin_country=${metadata.origin_country[0]}`, {
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

        recArray = recArray.sort((a, b) => b.rec.popularity - a.rec.popularity)

        return Response.json({
            result: "success",
            data: recArray
        })
    }
)