import fs from 'fs-extra'

import libFunctions from '@/lib/lib'
import { verifySession } from '@/lib/auth/lib'

export const GET = verifySession(
    async (req, { params }) => {
        const fileId = (await params).id
        const searchParams = req.nextUrl.searchParams
        let timestamp = searchParams.get('timestamp')
        let mime = searchParams.get('mime')

        const fileExt = libFunctions.getFileExtFromMime(mime)
        const filename = await libFunctions.getThumbnailAtTimestamp(fileId, timestamp, fileExt)
        const buffer = fs.readFileSync(`/tmp/${filename}`)

        return new Response(buffer, {
            headers: {
                'content-type': 'image/gif'
            }
        })
    }
)