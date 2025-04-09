import fs from 'fs-extra'

import libFunctions from '@/lib/lib'
import { verifySession } from '@/lib/auth/lib'

export const GET = verifySession(
    async (req, { params }) => {
        const fileId = (await params).id

        const searchParams = req.nextUrl.searchParams
        let mime = searchParams.get('mime')
        const fileExt = libFunctions.getFileExtFromMime(mime)

        // If we're given a duration, we get a set of thumbnails from the whole movie, split evenly by number
        // In an attempt to optimize, we can also optionally pass a range to only generate the thumbnails between some start and end point
        if (searchParams.has('duration')) {
            const number = searchParams.get('number')
            let start = 0
            let end = 0

            if (searchParams.has('start') && searchParams.has('end')) {
                start = searchParams.get('start')
                end = searchParams.get('end')
            }

            const filenames = await libFunctions.getThumbnails(fileId, fileExt, searchParams.get('duration'), number, start, end)
            let images = []
            for (const filename of filenames) {
                try {
                    const image = fs.readFileSync(`/tmp/${filename}`).toString('base64')
                    images.push(image)
                    fs.rmSync(`/tmp/${filename}`)
                } catch {
                    images.push('')
                }
            }
            return Response.json(images)

        // If we have a timestamp, get one thumbnail at that time
        } else {
            let timestamp = searchParams.get('timestamp')
            const filename = await libFunctions.getThumbnailAtTimestamp(fileId, fileExt, timestamp)
            const buffer = fs.readFileSync(`/tmp/${filename}`)
            return new Response(buffer, {
                headers: {
                    'content-type': 'image/gif'
                }
            })
        }
    }
)