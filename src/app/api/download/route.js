import { verifySession } from '@/lib/auth/lib'

import { create } from '@/lib/actions/downloads'
import { get } from '@/lib/actions/downloads'

export const POST = verifySession(
    async req => {
        const data = await req.json()
        const newDownloadResult = await create(data.name, data.category, data.magnet)
        return Response.json(newDownloadResult)
    }
)

export const GET = verifySession(
    async req => {
        const getDownloadResult = await get()
        return Response.json(getDownloadResult)
    }
)