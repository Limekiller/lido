import fs from 'fs-extra'

import libFunctions from '@/lib/lib'
import { verifySession } from '@/lib/auth/lib'

export const GET = verifySession(
    async (req, { params }) => {
        const fileId = (await params).id

        const searchParams = req.nextUrl.searchParams
        let mime = searchParams.get('mime')
        const fileExt = libFunctions.getFileExtFromMime(mime)

        if (searchParams.has('duration')) {
            const number = searchParams.get('number')
            const filenames = await libFunctions.getThumbnails(fileId, fileExt, searchParams.get('duration'), number)
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