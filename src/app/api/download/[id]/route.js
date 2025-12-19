
import { verifySession } from '@/lib/auth/lib'
import { update } from "@/lib/actions/downloads"

export const PUT = verifySession(
    async (req, { params }) => {
        const id = (await params).id
        const data = await req.json()
        const updateResponse = await update(id, data)
        return Response.json(updateResponse)
    }
)